// Test simple des endpoints API
const API_BASE = 'http://localhost:3000/api/v1';

// Test GET meetings
console.log('\n=== Test GET meetings ===');
try {
  const response = await fetch(`${API_BASE}/meetings`, {
    headers: {
      'Content-Type': 'application/json',
    },
    // Ajouter un cookie de session si nécessaire
  });
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test POST meeting
console.log('\n=== Test POST meeting ===');
try {
  const newMeeting = {
    title: 'Test Meeting',
    description: 'Test Description',
    type: 'CULTE',
    date: '2026-05-24T10:00:00.000Z',
    tags: ['test', 'demo']
  };

  const response = await fetch(`${API_BASE}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newMeeting),
  });
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  // Si la création a réussi, on récupère le ID pour les tests suivants
  if (data.success && data.data) {
    const meetingId = data.data.id;
    console.log(`\n=== Test GET meeting/${meetingId} ===`);

    const getResponse = await fetch(`${API_BASE}/meetings/${meetingId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));

    console.log(`\n=== Test PUT meeting/${meetingId} ===`);
    const updateData = {
      title: 'Test Meeting Updated',
      tags: ['test', 'updated', 'demo']
    };

    const updateResponse = await fetch(`${API_BASE}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const updateResult = await updateResponse.json();
    console.log('Status:', updateResponse.status);
    console.log('Response:', JSON.stringify(updateResult, null, 2));
  }
} catch (error) {
  console.error('Error:', error);
}

// Test GET groups/[id]/members
console.log('\n=== Test GET groups/[id]/members ===');
try {
  // Remplacer par un ID de groupe existant
  const groupId = 'test-group-id'; // TODO: remplacer par un ID réel
  const response = await fetch(`${API_BASE}/groups/${groupId}/members`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
} catch (error) {
  console.error('Error:', error);
}