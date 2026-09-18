const fetch = require('node-fetch');

async function testXLM() {
  const payload = {
    signer: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
    engagementId: `gig-test-${Date.now()}`,
    title: "Test XLM",
    description: "Testing native XLM",
    amount: 10,
    platformFee: 0,
    roles: {
      approver: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
      serviceProvider: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
      platformAddress: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
      releaseSigner: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
      disputeResolver: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV",
      receiver: "GA2V5QY3U434Z52N7Q7B3ZYXX6OFS5QYZ777PZV4XU5Z5XV7XV7XV7XV"
    },
    trustline: {
      symbol: "XLM",
      address: "native"
    },
    milestones: [
      { description: "Test" }
    ]
  };

  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer hOVWCctV2Ih0IZBIl7QC0Q.b4aa20e0b39f2963a433886ccc8e2af83fa5b8e78a639599308ffbcc3c198a4b'
  };

  const res = await fetch('https://dev.api.trustlesswork.com/deployer/single-release', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("With address 'native':", data);

  payload.trustline.address = "";
  const res2 = await fetch('https://dev.api.trustlesswork.com/deployer/single-release', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data2 = await res2.json();
  console.log("With address '':", data2);
  
  delete payload.trustline.address;
  const res3 = await fetch('https://dev.api.trustlesswork.com/deployer/single-release', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data3 = await res3.json();
  console.log("Without address:", data3);
}

testXLM();
