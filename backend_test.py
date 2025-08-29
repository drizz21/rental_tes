#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Rino Rental Sorong
Tests all endpoints with realistic Indonesian rental car data
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://car-rent-sorong.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

print(f"Testing API at: {API_BASE}")

class RinoRentalAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.created_vehicles = []
        self.created_bookings = []
        self.created_gallery = []
        self.admin_session = None
        
    def test_api_health(self):
        """Test basic API health check"""
        print("\n=== Testing API Health Check ===")
        try:
            response = self.session.get(f"{API_BASE}/")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == "Rino Rental Sorong API":
                    print("✅ API Health Check: PASSED")
                    return True
                else:
                    print("❌ API Health Check: FAILED - Unexpected message")
                    return False
            else:
                print("❌ API Health Check: FAILED - Wrong status code")
                return False
        except Exception as e:
            print(f"❌ API Health Check: FAILED - {str(e)}")
            return False

    def test_vehicle_crud(self):
        """Test all vehicle CRUD operations"""
        print("\n=== Testing Vehicle CRUD Operations ===")
        
        # Test data - realistic Indonesian rental cars
        test_vehicles = [
            {
                "nama": "Toyota Avanza 2022",
                "merek": "Toyota",
                "plat_nomor": "PB 1234 AB",
                "kategori": "MPV",
                "harga_harian": 350000,
                "harga_bulanan": 8500000,
                "kapasitas": 7,
                "transmisi": "Manual",
                "bahan_bakar": "Bensin",
                "deskripsi": "Mobil keluarga yang nyaman untuk perjalanan dalam kota maupun luar kota",
                "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            },
            {
                "nama": "Honda Brio Satya 2021",
                "merek": "Honda",
                "plat_nomor": "PB 5678 CD",
                "kategori": "Hatchback",
                "harga_harian": 250000,
                "harga_bulanan": 6000000,
                "kapasitas": 5,
                "transmisi": "Automatic",
                "bahan_bakar": "Bensin",
                "deskripsi": "Mobil compact yang irit dan mudah dikendarai",
                "foto": ""
            }
        ]
        
        success_count = 0
        
        # Test CREATE vehicles
        print("\n--- Testing CREATE Vehicle ---")
        for i, vehicle_data in enumerate(test_vehicles):
            try:
                response = self.session.post(f"{API_BASE}/kendaraan", json=vehicle_data)
                print(f"Vehicle {i+1} - Status Code: {response.status_code}")
                
                if response.status_code == 201:
                    data = response.json()
                    print(f"✅ Created vehicle: {data['nama']} (ID: {data['id']})")
                    self.created_vehicles.append(data['id'])
                    success_count += 1
                else:
                    print(f"❌ Failed to create vehicle {i+1}: {response.text}")
            except Exception as e:
                print(f"❌ Error creating vehicle {i+1}: {str(e)}")
        
        # Test READ all vehicles
        print("\n--- Testing READ All Vehicles ---")
        try:
            response = self.session.get(f"{API_BASE}/kendaraan")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                vehicles = response.json()
                print(f"✅ Retrieved {len(vehicles)} vehicles")
                success_count += 1
                
                # Display first vehicle details
                if vehicles:
                    first_vehicle = vehicles[0]
                    print(f"Sample vehicle: {first_vehicle.get('nama')} - Status: {first_vehicle.get('status')}")
            else:
                print(f"❌ Failed to get vehicles: {response.text}")
        except Exception as e:
            print(f"❌ Error getting vehicles: {str(e)}")
        
        # Test READ specific vehicle
        if self.created_vehicles:
            print("\n--- Testing READ Specific Vehicle ---")
            vehicle_id = self.created_vehicles[0]
            try:
                response = self.session.get(f"{API_BASE}/kendaraan/{vehicle_id}")
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    vehicle = response.json()
                    print(f"✅ Retrieved vehicle: {vehicle['nama']}")
                    success_count += 1
                else:
                    print(f"❌ Failed to get vehicle: {response.text}")
            except Exception as e:
                print(f"❌ Error getting specific vehicle: {str(e)}")
        
        # Test UPDATE vehicle
        if self.created_vehicles:
            print("\n--- Testing UPDATE Vehicle ---")
            vehicle_id = self.created_vehicles[0]
            update_data = {
                "status": "Perbaikan",
                "deskripsi": "Sedang dalam perbaikan rutin"
            }
            try:
                response = self.session.put(f"{API_BASE}/kendaraan/{vehicle_id}", json=update_data)
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    vehicle = response.json()
                    print(f"✅ Updated vehicle status to: {vehicle['status']}")
                    success_count += 1
                else:
                    print(f"❌ Failed to update vehicle: {response.text}")
            except Exception as e:
                print(f"❌ Error updating vehicle: {str(e)}")
        
        # Test validation - missing required fields
        print("\n--- Testing Validation (Missing Fields) ---")
        invalid_data = {"nama": "Test Car"}  # Missing required fields
        try:
            response = self.session.post(f"{API_BASE}/kendaraan", json=invalid_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                error = response.json()
                print(f"✅ Validation working: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Validation failed: Expected 400, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing validation: {str(e)}")
        
        print(f"\nVehicle CRUD Tests: {success_count}/6 passed")
        return success_count >= 5  # Allow 1 failure

    def test_booking_system(self):
        """Test booking system endpoints"""
        print("\n=== Testing Booking System ===")
        
        if not self.created_vehicles:
            print("❌ No vehicles available for booking test")
            return False
        
        success_count = 0
        
        # Test CREATE booking
        print("\n--- Testing CREATE Booking ---")
        booking_data = {
            "kendaraan_id": self.created_vehicles[0],
            "nama_penyewa": "Budi Santoso",
            "no_hp": "081234567890",
            "email": "budi.santoso@email.com",
            "tanggal_sewa": (datetime.now() + timedelta(days=1)).isoformat(),
            "durasi": 3,
            "tipe_sewa": "harian",
            "dengan_sopir": False,
            "alamat_jemput": "Jl. Ahmad Yani No. 123, Sorong",
            "catatan": "Untuk perjalanan keluarga",
            "total_harga": 1050000
        }
        
        try:
            response = self.session.post(f"{API_BASE}/booking", json=booking_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 201:
                booking = response.json()
                print(f"✅ Created booking for: {booking['nama_penyewa']} (ID: {booking['id']})")
                self.created_bookings.append(booking['id'])
                success_count += 1
            else:
                print(f"❌ Failed to create booking: {response.text}")
        except Exception as e:
            print(f"❌ Error creating booking: {str(e)}")
        
        # Test READ all bookings
        print("\n--- Testing READ All Bookings ---")
        try:
            response = self.session.get(f"{API_BASE}/booking")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                bookings = response.json()
                print(f"✅ Retrieved {len(bookings)} bookings")
                success_count += 1
                
                if bookings:
                    first_booking = bookings[0]
                    print(f"Sample booking: {first_booking.get('nama_penyewa')} - Status: {first_booking.get('status')}")
            else:
                print(f"❌ Failed to get bookings: {response.text}")
        except Exception as e:
            print(f"❌ Error getting bookings: {str(e)}")
        
        # Test booking validation - missing fields
        print("\n--- Testing Booking Validation ---")
        invalid_booking = {"nama_penyewa": "Test User"}  # Missing required fields
        try:
            response = self.session.post(f"{API_BASE}/booking", json=invalid_booking)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                error = response.json()
                print(f"✅ Booking validation working: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Booking validation failed: Expected 400, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing booking validation: {str(e)}")
        
        # Test booking with non-existent vehicle
        print("\n--- Testing Booking with Non-existent Vehicle ---")
        invalid_vehicle_booking = {
            "kendaraan_id": "non-existent-id",
            "nama_penyewa": "Test User",
            "no_hp": "081234567890",
            "tanggal_sewa": datetime.now().isoformat(),
            "durasi": 1
        }
        try:
            response = self.session.post(f"{API_BASE}/booking", json=invalid_vehicle_booking)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 404:
                error = response.json()
                print(f"✅ Non-existent vehicle check working: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Non-existent vehicle check failed: Expected 404, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing non-existent vehicle: {str(e)}")
        
        print(f"\nBooking System Tests: {success_count}/4 passed")
        return success_count >= 3

    def test_gallery_management(self):
        """Test gallery management endpoints"""
        print("\n=== Testing Gallery Management ===")
        
        success_count = 0
        
        # Test CREATE gallery item
        print("\n--- Testing CREATE Gallery Item ---")
        gallery_data = {
            "judul": "Toyota Avanza Interior",
            "deskripsi": "Interior yang nyaman dan luas untuk keluarga",
            "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            "kategori": "interior"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/gallery", json=gallery_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 201:
                gallery_item = response.json()
                print(f"✅ Created gallery item: {gallery_item['judul']} (ID: {gallery_item['id']})")
                self.created_gallery.append(gallery_item['id'])
                success_count += 1
            else:
                print(f"❌ Failed to create gallery item: {response.text}")
        except Exception as e:
            print(f"❌ Error creating gallery item: {str(e)}")
        
        # Test READ all gallery items
        print("\n--- Testing READ All Gallery Items ---")
        try:
            response = self.session.get(f"{API_BASE}/gallery")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                gallery = response.json()
                print(f"✅ Retrieved {len(gallery)} gallery items")
                success_count += 1
                
                if gallery:
                    first_item = gallery[0]
                    print(f"Sample gallery item: {first_item.get('judul')} - Category: {first_item.get('kategori')}")
            else:
                print(f"❌ Failed to get gallery items: {response.text}")
        except Exception as e:
            print(f"❌ Error getting gallery items: {str(e)}")
        
        # Test gallery validation - missing required fields
        print("\n--- Testing Gallery Validation ---")
        invalid_gallery = {"deskripsi": "Test description"}  # Missing foto and judul
        try:
            response = self.session.post(f"{API_BASE}/gallery", json=invalid_gallery)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                error = response.json()
                print(f"✅ Gallery validation working: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Gallery validation failed: Expected 400, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing gallery validation: {str(e)}")
        
        print(f"\nGallery Management Tests: {success_count}/3 passed")
        return success_count >= 2

    def test_financial_reports(self):
        """Test financial reporting endpoints"""
        print("\n=== Testing Financial Reports ===")
        
        success_count = 0
        periods = ['1-hari', '7-hari', '1-bulan']
        
        for period in periods:
            print(f"\n--- Testing Financial Report for {period} ---")
            try:
                response = self.session.get(f"{API_BASE}/laporan-keuangan?periode={period}")
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    report = response.json()
                    print(f"✅ Retrieved financial report for {period}")
                    print(f"   Total Pendapatan: Rp {report.get('total_pendapatan', 0):,}")
                    print(f"   Total Transaksi: {report.get('total_transaksi', 0)}")
                    print(f"   Rata-rata per Transaksi: Rp {report.get('rata_rata_per_transaksi', 0):,}")
                    success_count += 1
                else:
                    print(f"❌ Failed to get financial report for {period}: {response.text}")
            except Exception as e:
                print(f"❌ Error getting financial report for {period}: {str(e)}")
        
        # Test default period (no parameter)
        print("\n--- Testing Default Financial Report ---")
        try:
            response = self.session.get(f"{API_BASE}/laporan-keuangan")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                report = response.json()
                print(f"✅ Retrieved default financial report")
                print(f"   Period: {report.get('periode', 'unknown')}")
                success_count += 1
            else:
                print(f"❌ Failed to get default financial report: {response.text}")
        except Exception as e:
            print(f"❌ Error getting default financial report: {str(e)}")
        
        print(f"\nFinancial Reports Tests: {success_count}/4 passed")
        return success_count >= 3

    def test_admin_authentication(self):
        """Test admin authentication endpoints"""
        print("\n=== Testing Admin Authentication ===")
        
        success_count = 0
        
        # Test admin login with correct credentials
        print("\n--- Testing Admin Login (Correct Credentials) ---")
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/admin/login", json=login_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                session_data = response.json()
                print(f"✅ Admin login successful")
                print(f"   Session ID: {session_data['id']}")
                print(f"   Username: {session_data['username']}")
                self.admin_session = session_data
                success_count += 1
            else:
                print(f"❌ Admin login failed: {response.text}")
        except Exception as e:
            print(f"❌ Error during admin login: {str(e)}")
        
        # Test admin login with incorrect credentials
        print("\n--- Testing Admin Login (Incorrect Credentials) ---")
        wrong_login_data = {
            "username": "admin",
            "password": "wrongpassword"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/admin/login", json=wrong_login_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 401:
                error = response.json()
                print(f"✅ Incorrect credentials properly rejected: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Incorrect credentials not properly rejected: Expected 401, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing incorrect credentials: {str(e)}")
        
        # Test admin logout
        if self.admin_session:
            print("\n--- Testing Admin Logout ---")
            logout_data = {
                "session_id": self.admin_session['id']
            }
            
            try:
                response = self.session.post(f"{API_BASE}/admin/logout", json=logout_data)
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Admin logout successful: {result['message']}")
                    success_count += 1
                else:
                    print(f"❌ Admin logout failed: {response.text}")
            except Exception as e:
                print(f"❌ Error during admin logout: {str(e)}")
        
        print(f"\nAdmin Authentication Tests: {success_count}/3 passed")
        return success_count >= 2

    def test_statistics(self):
        """Test statistics endpoint"""
        print("\n=== Testing Statistics Endpoint ===")
        
        try:
            response = self.session.get(f"{API_BASE}/statistics")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                stats = response.json()
                print("✅ Statistics retrieved successfully:")
                print(f"   Total Kendaraan: {stats.get('total_kendaraan', 0)}")
                print(f"   Total Booking: {stats.get('total_booking', 0)}")
                print(f"   Kendaraan Tersedia: {stats.get('kendaraan_tersedia', 0)}")
                print(f"   Kendaraan Disewa: {stats.get('kendaraan_disewa', 0)}")
                return True
            else:
                print(f"❌ Failed to get statistics: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting statistics: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for non-existent routes"""
        print("\n=== Testing Error Handling ===")
        
        success_count = 0
        
        # Test non-existent route
        print("\n--- Testing Non-existent Route ---")
        try:
            response = self.session.get(f"{API_BASE}/non-existent-route")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 404:
                error = response.json()
                print(f"✅ Non-existent route properly handled: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Non-existent route not properly handled: Expected 404, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing non-existent route: {str(e)}")
        
        # Test non-existent vehicle ID
        print("\n--- Testing Non-existent Vehicle ID ---")
        try:
            response = self.session.get(f"{API_BASE}/kendaraan/non-existent-id")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 404:
                error = response.json()
                print(f"✅ Non-existent vehicle ID properly handled: {error['error']}")
                success_count += 1
            else:
                print(f"❌ Non-existent vehicle ID not properly handled: Expected 404, got {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing non-existent vehicle ID: {str(e)}")
        
        print(f"\nError Handling Tests: {success_count}/2 passed")
        return success_count >= 1

    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("\n=== Cleaning Up Test Data ===")
        
        # Delete created vehicles
        for vehicle_id in self.created_vehicles:
            try:
                response = self.session.delete(f"{API_BASE}/kendaraan/{vehicle_id}")
                if response.status_code == 200:
                    print(f"✅ Deleted vehicle: {vehicle_id}")
                else:
                    print(f"❌ Failed to delete vehicle {vehicle_id}: {response.text}")
            except Exception as e:
                print(f"❌ Error deleting vehicle {vehicle_id}: {str(e)}")
        
        print("Cleanup completed")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Comprehensive Rino Rental Sorong Backend API Tests")
        print("=" * 70)
        
        test_results = {}
        
        # Run all tests
        test_results['api_health'] = self.test_api_health()
        test_results['vehicle_crud'] = self.test_vehicle_crud()
        test_results['booking_system'] = self.test_booking_system()
        test_results['gallery_management'] = self.test_gallery_management()
        test_results['financial_reports'] = self.test_financial_reports()
        test_results['admin_authentication'] = self.test_admin_authentication()
        test_results['statistics'] = self.test_statistics()
        test_results['error_handling'] = self.test_error_handling()
        
        # Clean up test data
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 70)
        print("🏁 TEST SUMMARY")
        print("=" * 70)
        
        passed_tests = sum(1 for result in test_results.values() if result)
        total_tests = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        elif passed_tests >= total_tests * 0.8:
            print("⚠️  Most tests passed. Minor issues detected.")
        else:
            print("🚨 Multiple test failures detected. Backend needs attention.")
        
        return test_results

if __name__ == "__main__":
    tester = RinoRentalAPITester()
    results = tester.run_all_tests()