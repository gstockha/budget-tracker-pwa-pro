let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadPurchase();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// if we attempt a transaction offline
function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const transactionObjectStore = transaction.objectStore("new_transaction");
  transactionObjectStore.add(record);
}

function uploadPurchase() {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const transactionObjectStore = transaction.objectStore("new_transaction");
    const getAll = transactionObjectStore.getAll();

    // after .getAll() execution
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (serverResponse.message) {
                throw new Error(serverResponse);
                }
                const transaction = db.transaction(["new_transaction"], "readwrite");
                const transactionObjectStore = transaction.objectStore("new_transaction");
                transactionObjectStore.clear();
            })
            .catch((err) => {
                console.log(err);
            });
        }
    };
}

window.addEventListener("online", uploadPurchase);