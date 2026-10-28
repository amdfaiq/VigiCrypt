function vigenere(text, key, decrypt = false) {
    let result = '';
    key = key.toUpperCase();
    let keyIndex = 0;
    let steps = [];

    for (let i = 0; i < text.length; i++) {
        let char = text[i].toUpperCase();
        if (char.match(/[A-Z]/)) {
            let shift = key[keyIndex % key.length].charCodeAt(0) - 65;
            if (decrypt) shift = -shift;
            let newChar = String.fromCharCode(((char.charCodeAt(0) - 65 + shift + 26) % 26) + 65);
            result += newChar;
            steps.push(`${char} -> ${newChar} (Shift: ${shift})`);
            keyIndex++;
        } else {
            result += char;
        }
    }
    return { result, steps };
}

// Modifikasi encryptText() agar menyimpan history
function encryptText() {
    let plainText = document.getElementById('plainText').value;
    let key = document.getElementById('key').value;
    if (!plainText || !key) {
        alert("Please enter text and key!");
        return;
    }
    
    let { result, steps } = vigenere(plainText, key);
    document.getElementById('cipherText').innerText = result;
    localStorage.setItem('steps', JSON.stringify(steps));

    addToHistory("Encryption", plainText, key, result);
}

// Modifikasi decryptText() agar menyimpan history
function decryptText() {
    let cipherText = document.getElementById('cipherInput').value;
    let key = document.getElementById('keyInput').value;
    if (!cipherText || !key) {
        alert("Please enter text and key!");
        return;
    }
    
    let { result, steps } = vigenere(cipherText, key, true);
    document.getElementById('plainOutput').innerText = result;
    localStorage.setItem('steps', JSON.stringify(steps));

    addToHistory("Decryption", cipherText, key, result);
}

function showPopup(type) {
    let popup = document.getElementById('popup');
    let steps = JSON.parse(localStorage.getItem('steps')) || [];
    popup.innerHTML = `<div class='popup-content'><h3>${type === 'encrypt' ? 'Encryption' : 'Decryption'} Steps</h3><ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul><button onclick='closePopup()'>Close</button></div>`;
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode); // Simpan preferensi ke localStorage
}

// Fungsi untuk menerapkan mode gelap saat halaman dimuat
function applyDarkModePreference() {
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", applyDarkModePreference);

// Fungsi tambahan untuk suggestKey, angka dikonversi menjadi huruf
function convertNumbersToLetters(key) {
    let numberMap = {
        '0': 'A', '1': 'B', '2': 'C', '3': 'D', '4': 'E',
        '5': 'F', '6': 'G', '7': 'H', '8': 'I', '9': 'J'
    };
    return key.replace(/[0-9]/g, digit => numberMap[digit]);
}

// Fungsi untuk memberikan rekomendasi kunci
function suggestKey() {
    let text = document.getElementById('plainText').value;
    let now = new Date();
    let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    let day = String(now.getDate()).padStart(2, '0'); // 01, 02, ..., 31
    let year = String(now.getFullYear()).slice(-2);   // Ambil 2 digit terakhir tahun (misalnya: 2025 -> 25)
    let month = months[now.getMonth()];               // JAN, FEB, MAR, ..., DEC

    let words = text.match(/\b\w+\b/g);
    let suggestedWord = words ? words[0].toUpperCase() : "VIGEN"; // Ambil kata pertama atau default "VIGEN"

    let rawKey = suggestedWord.substring(0, 5) + day + month + year; // Contoh: "HELLO03MAR25"
    let finalKey = convertNumbersToLetters(rawKey); // Konversi angka ke huruf

    document.getElementById('key').value = finalKey;
}

// Fungsi untuk menambahkan history ke localStorage
function addToHistory(type, text, key, result) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let timestamp = new Date().toLocaleString(); // Waktu enkripsi/dekripsi

    history.push({
        type: type, // "Encryption" atau "Decryption"
        text: text,
        key: key,
        result: result,
        timestamp: timestamp
    });

    localStorage.setItem('history', JSON.stringify(history));
    displayHistory(); // Perbarui tampilan history
}

// Fungsi untuk menampilkan history di halaman history.html
function displayHistory() {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let historyContainer = document.getElementById('history');

    if (!historyContainer) return; // Jika elemen tidak ada, hentikan

    if (history.length === 0) {
        historyContainer.innerHTML = "<p>No history yet.</p>";
        return;
    }

    historyContainer.innerHTML = history.map((entry, index) => `
        <div class="history-item">
            <strong>${entry.type}</strong> <br>
            <small>${entry.timestamp}</small><br>
            <b>Key:</b> ${entry.key} <br>
            <b>Input:</b> ${entry.text} <br>
            <b>Result:</b> ${entry.result} <br>
            <button class="delete-btn" onclick="deleteHistoryEntry(${index})">Delete</button>
            <hr>
        </div>
    `).join('');
}

// Fungsi untuk menghapus satu entri history berdasarkan indeks
function deleteHistoryEntry(index) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    history.splice(index, 1); // Hapus elemen dari array
    localStorage.setItem('history', JSON.stringify(history)); // Simpan perubahan
    displayHistory(); // Refresh tampilan history
}

// Fungsi untuk menghapus seluruh history
function clearHistory() {
    localStorage.removeItem('history');
    displayHistory();
}

// Panggil displayHistory() saat halaman history dimuat
document.addEventListener("DOMContentLoaded", displayHistory);
