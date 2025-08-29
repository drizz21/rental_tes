import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint - GET /api/
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Rino Rental Sorong API" }))
    }

    // KENDARAAN ENDPOINTS
    
    // GET /api/kendaraan - Ambil semua kendaraan
    if (route === '/kendaraan' && method === 'GET') {
      const kendaraan = await db.collection('kendaraan')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      // Remove MongoDB _id field
      const cleanKendaraan = kendaraan.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanKendaraan))
    }

    // POST /api/kendaraan - Tambah kendaraan baru
    if (route === '/kendaraan' && method === 'POST') {
      const body = await request.json()
      
      const requiredFields = ['nama', 'merek', 'plat_nomor', 'kategori', 'harga_harian', 'harga_bulanan', 'kapasitas', 'transmisi', 'bahan_bakar']
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return handleCORS(NextResponse.json(
          { error: `Field wajib tidak diisi: ${missingFields.join(', ')}` },
          { status: 400 }
        ))
      }

      const kendaraan = {
        id: uuidv4(),
        nama: body.nama,
        merek: body.merek,
        plat_nomor: body.plat_nomor,
        kategori: body.kategori,
        harga_harian: parseInt(body.harga_harian),
        harga_bulanan: parseInt(body.harga_bulanan),
        kapasitas: parseInt(body.kapasitas),
        transmisi: body.transmisi,
        bahan_bakar: body.bahan_bakar,
        status: body.status || 'Tersedia',
        deskripsi: body.deskripsi || '',
        foto: body.foto || '',
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('kendaraan').insertOne(kendaraan)
      
      // Remove MongoDB _id field
      const { _id, ...cleanKendaraan } = kendaraan
      return handleCORS(NextResponse.json(cleanKendaraan, { status: 201 }))
    }

    // GET /api/kendaraan/{id} - Ambil kendaraan berdasarkan ID
    if (route.startsWith('/kendaraan/') && method === 'GET') {
      const id = path[1]
      const kendaraan = await db.collection('kendaraan').findOne({ id })
      
      if (!kendaraan) {
        return handleCORS(NextResponse.json(
          { error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        ))
      }

      const { _id, ...cleanKendaraan } = kendaraan
      return handleCORS(NextResponse.json(cleanKendaraan))
    }

    // PUT /api/kendaraan/{id} - Update kendaraan
    if (route.startsWith('/kendaraan/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()

      const updateData = { ...body, updated_at: new Date() }
      delete updateData.id // Prevent ID changes
      delete updateData._id // Prevent MongoDB ID changes

      const result = await db.collection('kendaraan').updateOne(
        { id },
        { $set: updateData }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        ))
      }

      const updatedKendaraan = await db.collection('kendaraan').findOne({ id })
      const { _id, ...cleanKendaraan } = updatedKendaraan
      
      return handleCORS(NextResponse.json(cleanKendaraan))
    }

    // DELETE /api/kendaraan/{id} - Hapus kendaraan
    if (route.startsWith('/kendaraan/') && method === 'DELETE') {
      const id = path[1]
      
      const result = await db.collection('kendaraan').deleteOne({ id })
      
      if (result.deletedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ message: 'Kendaraan berhasil dihapus' }))
    }

    // BOOKING ENDPOINTS

    // GET /api/booking - Ambil semua booking
    if (route === '/booking' && method === 'GET') {
      const bookings = await db.collection('booking')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      const cleanBookings = bookings.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanBookings))
    }

    // POST /api/booking - Buat booking baru
    if (route === '/booking' && method === 'POST') {
      const body = await request.json()
      
      const requiredFields = ['kendaraan_id', 'nama_penyewa', 'no_hp', 'tanggal_sewa', 'durasi']
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return handleCORS(NextResponse.json(
          { error: `Field wajib tidak diisi: ${missingFields.join(', ')}` },
          { status: 400 }
        ))
      }

      // Check if kendaraan exists and available
      const kendaraan = await db.collection('kendaraan').findOne({ id: body.kendaraan_id })
      if (!kendaraan) {
        return handleCORS(NextResponse.json(
          { error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        ))
      }

      if (kendaraan.status !== 'Tersedia') {
        return handleCORS(NextResponse.json(
          { error: 'Kendaraan tidak tersedia' },
          { status: 400 }
        ))
      }

      const booking = {
        id: uuidv4(),
        kendaraan_id: body.kendaraan_id,
        nama_penyewa: body.nama_penyewa,
        no_hp: body.no_hp,
        email: body.email || '',
        tanggal_sewa: new Date(body.tanggal_sewa),
        durasi: parseInt(body.durasi),
        tipe_sewa: body.tipe_sewa || 'harian', // harian/bulanan
        dengan_sopir: body.dengan_sopir || false,
        alamat_jemput: body.alamat_jemput || '',
        catatan: body.catatan || '',
        status: 'Pending',
        total_harga: body.total_harga || 0,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('booking').insertOne(booking)

      // Update kendaraan status to 'Disewa' if booking is confirmed
      if (body.confirm_booking) {
        await db.collection('kendaraan').updateOne(
          { id: body.kendaraan_id },
          { $set: { status: 'Disewa', updated_at: new Date() } }
        )
      }
      
      const { _id, ...cleanBooking } = booking
      return handleCORS(NextResponse.json(cleanBooking, { status: 201 }))
    }

    // GALLERY ENDPOINTS

    // GET /api/gallery - Ambil semua foto gallery
    if (route === '/gallery' && method === 'GET') {
      const gallery = await db.collection('gallery')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      const cleanGallery = gallery.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanGallery))
    }

    // POST /api/gallery - Upload foto gallery
    if (route === '/gallery' && method === 'POST') {
      const body = await request.json()
      
      if (!body.foto || !body.judul) {
        return handleCORS(NextResponse.json(
          { error: 'Foto dan judul wajib diisi' },
          { status: 400 }
        ))
      }

      const galleryItem = {
        id: uuidv4(),
        judul: body.judul,
        deskripsi: body.deskripsi || '',
        foto: body.foto, // base64 string
        kategori: body.kategori || 'kendaraan',
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('gallery').insertOne(galleryItem)
      
      const { _id, ...cleanGalleryItem } = galleryItem
      return handleCORS(NextResponse.json(cleanGalleryItem, { status: 201 }))
    }

    // LAPORAN KEUANGAN ENDPOINTS

    // GET /api/laporan-keuangan - Ambil laporan keuangan
    if (route === '/laporan-keuangan' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const periode = searchParams.get('periode') || '1-hari' // 1-hari, 7-hari, 1-bulan
      
      let dateFilter = {}
      const now = new Date()
      
      switch (periode) {
        case '1-hari':
          dateFilter = {
            created_at: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            }
          }
          break
        case '7-hari':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = {
            created_at: {
              $gte: weekAgo,
              $lt: now
            }
          }
          break
        case '1-bulan':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          dateFilter = {
            created_at: {
              $gte: monthAgo,
              $lt: now
            }
          }
          break
      }

      // Ambil booking yang sudah dikonfirmasi
      const bookings = await db.collection('booking')
        .find({ 
          ...dateFilter,
          status: { $in: ['Dikonfirmasi', 'Selesai'] }
        })
        .toArray()

      const totalPendapatan = bookings.reduce((sum, booking) => sum + (booking.total_harga || 0), 0)
      const totalTransaksi = bookings.length

      // Group by tanggal untuk chart
      const pendapatanHarian = bookings.reduce((acc, booking) => {
        const tanggal = booking.created_at.toISOString().split('T')[0]
        acc[tanggal] = (acc[tanggal] || 0) + booking.total_harga
        return acc
      }, {})

      const laporan = {
        periode,
        total_pendapatan: totalPendapatan,
        total_transaksi: totalTransaksi,
        rata_rata_per_transaksi: totalTransaksi > 0 ? Math.round(totalPendapatan / totalTransaksi) : 0,
        pendapatan_harian: Object.entries(pendapatanHarian).map(([tanggal, pendapatan]) => ({
          tanggal,
          pendapatan
        })),
        detail_booking: bookings.map(({ _id, ...rest }) => rest)
      }

      return handleCORS(NextResponse.json(laporan))
    }

    // ADMIN AUTH ENDPOINTS

    // POST /api/admin/login - Login admin
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      
      // Simple admin auth - in production use proper authentication
      if (body.username === 'admin' && body.password === 'admin123') {
        const adminSession = {
          id: uuidv4(),
          username: body.username,
          login_time: new Date(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }

        await db.collection('admin_sessions').insertOne(adminSession)
        
        const { _id, ...cleanSession } = adminSession
        return handleCORS(NextResponse.json(cleanSession))
      }

      return handleCORS(NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      ))
    }

    // POST /api/admin/logout - Logout admin
    if (route === '/admin/logout' && method === 'POST') {
      const body = await request.json()
      
      await db.collection('admin_sessions').deleteOne({ id: body.session_id })
      
      return handleCORS(NextResponse.json({ message: 'Logout berhasil' }))
    }

    // Statistics endpoint
    if (route === '/statistics' && method === 'GET') {
      const totalKendaraan = await db.collection('kendaraan').countDocuments()
      const totalBooking = await db.collection('booking').countDocuments()
      const kendaraanTersedia = await db.collection('kendaraan').countDocuments({ status: 'Tersedia' })
      const kendaraanDisewa = await db.collection('kendaraan').countDocuments({ status: 'Disewa' })

      const stats = {
        total_kendaraan: totalKendaraan,
        total_booking: totalBooking,
        kendaraan_tersedia: kendaraanTersedia,
        kendaraan_disewa: kendaraanDisewa
      }

      return handleCORS(NextResponse.json(stats))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute