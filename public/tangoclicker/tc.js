document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 30 - 15; // Adjust range for parallax
    const y = (e.clientY / window.innerHeight) * 30 - 15; // Adjust range for parallax
    document.querySelector('.background').style.transform = `translate(${x}px, ${y}px)`;
});
