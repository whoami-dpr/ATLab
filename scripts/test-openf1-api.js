// Test script to verify OpenF1 API functionality

async function testOpenF1API() {
  console.log("🧪 Testing OpenF1 API endpoints...")

  const endpoints = [
    {
      name: "Drivers",
      url: "https://api.openf1.org/v1/drivers?session_key=latest",
    },
    {
      name: "Sessions 2024",
      url: "https://api.openf1.org/v1/sessions?year=2024",
    },
    {
      name: "Meetings 2024",
      url: "https://api.openf1.org/v1/meetings?year=2024",
    },
    {
      name: "Results Latest",
      url: "https://api.openf1.org/v1/results?session_key=latest",
    },
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint.name}`)
      console.log(`URL: ${endpoint.url}`)

      const response = await fetch(endpoint.url)

      console.log(`Status: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success! Data length: ${Array.isArray(data) ? data.length : "Object"}`)

        if (Array.isArray(data) && data.length > 0) {
          console.log("Sample data:", JSON.stringify(data[0], null, 2))
        } else if (typeof data === "object") {
          console.log("Data keys:", Object.keys(data))
        }
      } else {
        console.log(`❌ Failed: ${response.status}`)
        const errorText = await response.text()
        console.log("Error:", errorText)
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }

    // Wait between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Test alternative endpoints
  console.log("\n🔄 Testing alternative F1 APIs...")

  const alternatives = [
    {
      name: "Jolpica F1 API",
      url: "https://api.jolpi.ca/ergast/f1/2024/driverStandings.json",
    },
    {
      name: "F1 API Herokuapp",
      url: "https://f1-api.herokuapp.com/api/v1/drivers/standings/2024",
    },
  ]

  for (const alt of alternatives) {
    try {
      console.log(`\n📡 Testing: ${alt.name}`)
      const response = await fetch(alt.url)
      console.log(`Status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${alt.name} works!`)
        console.log("Data structure:", Object.keys(data))
      } else {
        console.log(`❌ ${alt.name} failed: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${alt.name} error: ${error.message}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("\n🏁 API Testing Complete!")
}

// Run the test
testOpenF1API()
