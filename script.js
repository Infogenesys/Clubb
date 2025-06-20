document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const bookingsList = document.getElementById('bookings');
    let editingIndex = null;

    // Restrict booking form to logged-in users only
    function getCurrentUser() {
        return localStorage.getItem('clubhouseUser');
    }

    // Load bookings from localStorage
    function getBookings() {
        return JSON.parse(localStorage.getItem('clubhouseBookings') || '[]');
    }
    function saveBookings(bookings) {
        localStorage.setItem('clubhouseBookings', JSON.stringify(bookings));
    }

    function loadBookings() {
        bookingsList.innerHTML = '';
        const user = getCurrentUser();
        if (!user) return;
        const bookings = getBookings();
        // Show only bookings for the logged-in user
        let userBookings = bookings.filter(b => b.user === user);
        // Sort by date and time
        userBookings.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        userBookings.forEach((booking, idx) => {
            // Calculate end time (2 hours duration)
            const start = new Date(booking.date + 'T' + booking.time);
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
            const endTime = end.toTimeString().slice(0, 5);
            const li = document.createElement('li');
            li.textContent = `${booking.date} ${booking.time} - ${endTime} | ${booking.name} (${booking.email})`;
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.style.marginLeft = '1rem';
            editBtn.onclick = function() {
                bookingForm.name.value = booking.name;
                bookingForm.email.value = booking.email;
                bookingForm.date.value = booking.date;
                bookingForm.time.value = booking.time;
                editingIndex = bookings.findIndex(b => b.user === user && b.date === booking.date && b.time === booking.time);
                bookingForm.querySelector('button[type="submit"]').textContent = 'Update Booking';
            };
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.marginLeft = '0.5rem';
            cancelBtn.onclick = function() {
                const allBookings = getBookings();
                const removeIdx = allBookings.findIndex(b => b.user === user && b.date === booking.date && b.time === booking.time);
                if (removeIdx > -1) {
                    allBookings.splice(removeIdx, 1);
                    saveBookings(allBookings);
                    loadBookings();
                }
            };
            li.appendChild(editBtn);
            li.appendChild(cancelBtn);
            bookingsList.appendChild(li);
        });
    }

    // Save or update booking
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) {
            alert('You must be logged in to book.');
            return;
        }
        const name = bookingForm.name.value;
        const email = bookingForm.email.value;
        const date = bookingForm.date.value;
        const time = bookingForm.time.value;
        if (!name || !email || !date || !time) {
            alert('Please fill all fields.');
            return;
        }
        let bookings = getBookings();
        // Prevent overlapping bookings for any user (2-hour window)
        const newStart = new Date(date + 'T' + time);
        const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);
        const isOverlapping = bookings.some((b, idx) => {
            if (editingIndex !== null && idx === editingIndex) return false;
            if (b.date !== date) return false;
            const bStart = new Date(b.date + 'T' + b.time);
            const bEnd = new Date(bStart.getTime() + 2 * 60 * 60 * 1000);
            // Check for overlap
            return (newStart < bEnd && newEnd > bStart);
        });
        if (isOverlapping) {
            alert('This slot overlaps with an existing booking. Please choose another time.');
            return;
        }
        if (editingIndex !== null) {
            // Update existing booking
            bookings[editingIndex] = { name, email, date, time, user };
            editingIndex = null;
            bookingForm.querySelector('button[type="submit"]').textContent = 'Book Now';
        } else {
            // Add new booking
            bookings.push({ name, email, date, time, user });
        }
        saveBookings(bookings);
        loadBookings();
        bookingForm.reset();
    });

    // Only show bookings if user is logged in
    if (getCurrentUser()) {
        loadBookings();
    }

    // Reload bookings on login/logout (optional, if you want to support dynamic reload)
    window.addEventListener('storage', function(e) {
        if (e.key === 'clubhouseUser' || e.key === 'clubhouseBookings') {
            loadBookings();
        }
    });
});
