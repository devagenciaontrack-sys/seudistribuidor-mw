document.querySelectorAll('.section').forEach((section) => section.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.section.reveal').forEach((section) => revealObserver.observe(section));
