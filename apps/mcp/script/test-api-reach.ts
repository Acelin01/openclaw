
// no import needed for fetch in Node 22
async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/public/health');
    console.log('127.0.0.1 success:', res.status);
  } catch (e) {
    console.log('127.0.0.1 failed:', e.message);
  }

  try {
    const res = await fetch('http://localhost:8000/api/v1/public/health');
    console.log('localhost success:', res.status);
  } catch (e) {
    console.log('localhost failed:', e.message);
  }
}

test();
