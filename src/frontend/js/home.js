window.addEventListener('resize', () => {
  const navbarHeight = document.getElementById('navbar').offsetHeight;
  const screenHeight = window.innerHeight;
  const remainingHeight = screenHeight - navbarHeight;

  const carousel = document.getElementById('carouselExampleDark');
  carousel.style.height = `${remainingHeight}px`;
  carousel.style.top = `${navbarHeight}px`; // add 'px' unit
  carousel.style.position = 'relative'; // add this to position the carousel absolutely
  // const inner = document.getElementById('carouselInner');
  // inner.style.height = `${remainingHeight}px`;
  // inner.style.top = `${navbarHeight}px`; // add 'px' unit
  // inner.style.position = 'relative'; // add this to position the carousel absolutely
});