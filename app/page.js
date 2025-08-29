'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Car, Phone, MapPin, Clock, Users, Fuel, Settings, Star, WhatsApp } from 'lucide-react'

export default function App() {
  const [kendaraan, setKendaraan] = useState([])
  const [filteredKendaraan, setFilteredKendaraan] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedKendaraan, setSelectedKendaraan] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKategori, setFilterKategori] = useState('semua')
  const [filterStatus, setFilterStatus] = useState('semua')

  useEffect(() => {
    fetchKendaraan()
  }, [])

  useEffect(() => {
    filterKendaraan()
  }, [kendaraan, searchTerm, filterKategori, filterStatus])

  const fetchKendaraan = async () => {
    try {
      const response = await fetch('/api/kendaraan')
      if (response.ok) {
        const data = await response.json()
        setKendaraan(data)
      } else {
        // Fallback dengan sample data jika API belum ready
        setSampleData()
      }
    } catch (error) {
      console.error('Error fetching kendaraan:', error)
      setSampleData()
    } finally {
      setLoading(false)
    }
  }

  const setSampleData = () => {
    const sampleKendaraan = [
      {
        id: '1',
        nama: 'Toyota Avanza',
        merek: 'Toyota',
        plat_nomor: 'PB 1234 AA',
        kategori: 'MPV',
        harga_harian: 350000,
        harga_bulanan: 8500000,
        kapasitas: 7,
        transmisi: 'Manual',
        bahan_bakar: 'Bensin',
        status: 'Tersedia',
        deskripsi: 'Mobil keluarga yang nyaman untuk perjalanan dalam kota maupun luar kota',
        foto: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHx2ZWhpY2xlc3xlbnwwfHx8fDE3NTY0ODE4NjV8MA&ixlib=rb-4.1.0&q=85'
      },
      {
        id: '2',
        nama: 'Honda Civic',
        merek: 'Honda',
        plat_nomor: 'PB 5678 BB',
        kategori: 'Sedan',
        harga_harian: 450000,
        harga_bulanan: 11500000,
        kapasitas: 5,
        transmisi: 'Automatic',
        bahan_bakar: 'Bensin',
        status: 'Disewa',
        deskripsi: 'Sedan mewah dengan performa tinggi dan kenyamanan maksimal',
        foto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxjYXJzfGVufDB8fHx8MTc1NjQ4MTg1Mnww&ixlib=rb-4.1.0&q=85'
      },
      {
        id: '3',
        nama: 'Daihatsu Xenia',
        merek: 'Daihatsu',
        plat_nomor: 'PB 9012 CC',
        kategori: 'MPV',
        harga_harian: 300000,
        harga_bulanan: 7500000,
        kapasitas: 7,
        transmisi: 'Manual',
        bahan_bakar: 'Bensin',
        status: 'Perbaikan',
        deskripsi: 'MPV ekonomis cocok untuk keluarga besar dengan budget terbatas',
        foto: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxjYXJzfGVufDB8fHx8MTc1NjQ4MTg1Mnww&ixlib=rb-4.1.0&q=85'
      }
    ]
    setKendaraan(sampleKendaraan)
  }

  const filterKendaraan = () => {
    let filtered = kendaraan

    if (searchTerm) {
      filtered = filtered.filter(k => 
        k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.merek.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterKategori !== 'semua') {
      filtered = filtered.filter(k => k.kategori === filterKategori)
    }

    if (filterStatus !== 'semua') {
      filtered = filtered.filter(k => k.status === filterStatus)
    }

    setFilteredKendaraan(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tersedia': return 'bg-green-100 text-green-800'
      case 'Disewa': return 'bg-red-100 text-red-800'
      case 'Perbaikan': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const handleBooking = (kendaraan) => {
    const message = `Halo Rino Rental Sorong! Saya tertarik untuk menyewa:\n\n🚗 Kendaraan: ${kendaraan.nama}\n💰 Harga: ${formatRupiah(kendaraan.harga_harian)}/hari\n👥 Kapasitas: ${kendaraan.kapasitas} orang\n\nMohon informasi lebih lanjut mengenai ketersediaan dan prosedur sewa. Terima kasih!`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Rino Rental Sorong</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <Button 
                onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div 
            className="min-h-[400px] bg-cover bg-center rounded-lg flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1565043666747-69f6646db940?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxjYXIlMjByZW50YWx8ZW58MHx8fHwxNzU2MzY3NDA0fDA&ixlib=rb-4.1.0&q=85')`
            }}
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">Sewa Mobil Terpercaya di Sorong</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Pilihan lengkap kendaraan berkualitas dengan harga terjangkau. 
                Layanan harian, bulanan, dengan atau tanpa sopir.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => document.getElementById('kendaraan-section').scrollIntoView()}
                >
                  Lihat Kendaraan
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Hubungi Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Layanan */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mengapa Pilih Rino Rental?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Layanan 24/7</h3>
              <p className="text-gray-600">Siap melayani kebutuhan rental Anda kapan saja</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">Kendaraan terawat dan berkualitas tinggi</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Antar Jemput</h3>
              <p className="text-gray-600">Layanan antar jemput gratis di area Sorong</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Kendaraan */}
      <section id="kendaraan-section" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pilihan Kendaraan</h2>
          
          {/* Filter */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cari kendaraan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                <SelectItem value="MPV">MPV</SelectItem>
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Hatchback">Hatchback</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="Tersedia">Tersedia</SelectItem>
                <SelectItem value="Disewa">Disewa</SelectItem>
                <SelectItem value="Perbaikan">Perbaikan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              Reset Filter
            </Button>
          </div>

          {/* Grid Kendaraan */}
          {loading ? (
            <div className="text-center py-8">Loading kendaraan...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKendaraan.map((kendaraan) => (
                <Card key={kendaraan.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img 
                      src={kendaraan.foto} 
                      alt={kendaraan.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{kendaraan.nama}</h3>
                      <Badge className={getStatusColor(kendaraan.status)}>
                        {kendaraan.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{kendaraan.merek} • {kendaraan.plat_nomor}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{kendaraan.kapasitas} orang</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span>{kendaraan.transmisi}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4" />
                        <span>{kendaraan.bahan_bakar}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatRupiah(kendaraan.harga_harian)}
                        <span className="text-sm text-gray-500">/hari</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatRupiah(kendaraan.harga_bulanan)}/bulan
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => setSelectedKendaraan(kendaraan)}
                      >
                        Lihat Detail
                      </Button>
                      {kendaraan.status === 'Tersedia' && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleBooking(kendaraan)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tentang Kami */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Tentang Rino Rental Sorong</h2>
              <p className="text-gray-600 mb-4">
                Rino Rental Sorong adalah penyedia layanan sewa kendaraan terpercaya di Kota Sorong. 
                Dengan pengalaman bertahun-tahun, kami berkomitmen memberikan pelayanan terbaik 
                untuk kebutuhan transportasi Anda.
              </p>
              <p className="text-gray-600 mb-6">
                Kami menyediakan berbagai jenis kendaraan mulai dari mobil keluarga hingga kendaraan 
                mewah dengan sistem sewa harian, mingguan, hingga bulanan. Semua kendaraan kami 
                terawat dengan baik dan siap melayani perjalanan Anda.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">50+</div>
                  <div className="text-sm text-gray-600">Kendaraan</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600">Pelanggan Puas</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Hubungi Kami</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span>+62 812-3456-7890</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Jl. Raya Sorong No. 123, Sorong, Papua Barat</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Senin - Minggu: 06:00 - 22:00</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Chat WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detail Kendaraan */}
      <Dialog open={!!selectedKendaraan} onOpenChange={() => setSelectedKendaraan(null)}>
        <DialogContent className="max-w-2xl">
          {selectedKendaraan && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedKendaraan.nama}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedKendaraan.foto} 
                    alt={selectedKendaraan.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Spesifikasi</h4>
                    <div className="space-y-2 text-sm">
                      <div>Merek: {selectedKendaraan.merek}</div>
                      <div>Plat Nomor: {selectedKendaraan.plat_nomor}</div>
                      <div>Kategori: {selectedKendaraan.kategori}</div>
                      <div>Kapasitas: {selectedKendaraan.kapasitas} orang</div>
                      <div>Transmisi: {selectedKendaraan.transmisi}</div>
                      <div>Bahan Bakar: {selectedKendaraan.bahan_bakar}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Harga Sewa</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-blue-600">
                        {formatRupiah(selectedKendaraan.harga_harian)}/hari
                      </div>
                      <div className="text-gray-600">
                        {formatRupiah(selectedKendaraan.harga_bulanan)}/bulan
                      </div>
                      <Badge className={getStatusColor(selectedKendaraan.status)}>
                        {selectedKendaraan.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Deskripsi</h4>
                  <p className="text-gray-600">{selectedKendaraan.deskripsi}</p>
                </div>

                {selectedKendaraan.status === 'Tersedia' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleBooking(selectedKendaraan)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Sewa Sekarang via WhatsApp
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6" />
                <span className="text-xl font-bold">Rino Rental Sorong</span>
              </div>
              <p className="text-gray-400">
                Layanan sewa kendaraan terpercaya di Sorong dengan harga terjangkau dan pelayanan terbaik.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Layanan Kami</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sewa Harian</li>
                <li>Sewa Bulanan</li>
                <li>Dengan Sopir</li>
                <li>Lepas Kunci</li>
                <li>Antar Jemput</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <div className="space-y-2 text-gray-400">
                <div>+62 812-3456-7890</div>
                <div>info@rinorental.com</div>
                <div>Jl. Raya Sorong No. 123<br />Sorong, Papua Barat</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rino Rental Sorong. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}