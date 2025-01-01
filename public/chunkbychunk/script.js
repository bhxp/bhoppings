document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 40 - 15; // Adjust range for parallax
    const y = (e.clientY / window.innerHeight) * 40 - 15; // Adjust range for parallax
    document.querySelector('#background').style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
});