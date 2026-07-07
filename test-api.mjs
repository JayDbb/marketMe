async function testApi() {
  console.log("🚀 Testing MarketMe-AI API...");

  // 1. Test Strategy Generation
  console.log("\n1️⃣ Generating Strategy...");
  const strategyPayload = {
    business_id: "test-biz-123",
    business_name: "Acme Corp",
    industry: "Tech",
    target_audience: "Developers",
    goals: "Brand Awareness",
    platforms: ["twitter"]
  };

  let strategyId;
  try {
    const res = await fetch('http://localhost:8000/api/v1/strategy/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyPayload)
    });

    if (!res.ok) {
      console.error(`❌ Strategy Generation Failed: ${res.status}`);
      console.error(await res.text());
      return;
    }

    const data = await res.json();
    strategyId = data.strategy_id;
    console.log("✅ Strategy Generated successfully!");
    console.log(`   Strategy ID: ${strategyId}`);
    console.log(`   Preview: ${data.strategy?.overview || 'N/A'}`);
  } catch (err) {
    console.error("❌ Failed to connect to Strategy endpoint:", err.message);
    return;
  }

  if (!strategyId) {
    console.error("❌ No strategy ID returned, skipping Posts Generation.");
    return;
  }

  // 2. Test Posts Generation
  console.log("\n2️⃣ Generating Posts...");
  const postsPayload = {
    strategy_id: strategyId,
    platform: "twitter",
    num_posts: 2
  };

  try {
    const res = await fetch('http://localhost:8000/api/v1/posts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postsPayload)
    });

    if (!res.ok) {
      console.error(`❌ Posts Generation Failed: ${res.status}`);
      console.error(await res.text());
      return;
    }

    const data = await res.json();
    console.log("✅ Posts Generated successfully!");
    console.log(`   Received ${data.posts?.length} posts.`);
    if (data.posts && data.posts.length > 0) {
      console.log(`   Sample Post 1: ${data.posts[0].caption}`);
    }
  } catch (err) {
    console.error("❌ Failed to connect to Posts endpoint:", err.message);
  }
}

testApi();
