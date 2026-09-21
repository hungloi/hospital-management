async function seedDatabase() {
  try {
    console.log('🌱 Calling seed API...');
    const response = await fetch('http://localhost:3000/api/admin/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('✅ Seed result:', data);
    
    if (data.success) {
      console.log('🎉 Database seeded successfully!');
    } else {
      console.error('❌ Seed failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
