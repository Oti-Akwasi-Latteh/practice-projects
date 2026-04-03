
const bookingID = localStorage.getItem("latestBookingID");

if (bookingID) {
    document.getElementById("bookingID").textContent = "#" + bookingID;
}
