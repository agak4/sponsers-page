let currentResultIndex = 0;
let searchResults = [];

// ===== 알림 =====

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.opacity = '1'; }, 10);
    setTimeout(() => { notification.style.opacity = '0'; }, 1500);
    setTimeout(() => { notification.style.display = 'none'; }, 2000);
}

// ===== 검색 =====

function searchSponsor() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    if (searchTerm === '') {
        showNotification('검색어를 입력해주세요.');
        return;
    }

    searchResults = [];
    currentResultIndex = 0;

    document.querySelectorAll('.sponsor-table td').forEach(cell => {
        cell.classList.remove('highlight');
        if (cell.textContent.toLowerCase().includes(searchTerm)) {
            searchResults.push(cell);
        }
    });

    if (searchResults.length > 0) {
        highlightResult(0);
        showResultNavigation();
    } else {
        showNotification('검색 결과가 없습니다.');
        hideResultNavigation();
    }
}

function highlightResult(index) {
    searchResults.forEach(cell => cell.classList.remove('highlight'));
    searchResults[index].classList.add('highlight');
    searchResults[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('resultCount').textContent = `${index + 1} / ${searchResults.length}`;
}

function showResultNavigation() {
    document.getElementById('resultNavigation').style.display = 'block';
    document.getElementById('resultCount').textContent = `${currentResultIndex + 1} / ${searchResults.length}`;
}

function hideResultNavigation() {
    document.getElementById('resultNavigation').style.display = 'none';
}

// ===== 뷰포트 진입 감지 (섹션 이미지 페이드인) =====

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.sponsor-image').forEach(img => observer.observe(img));
}

// ===== 슬라이더 =====

function initializeSlider(sliderWrapper) {
    const slides = sliderWrapper.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const sliderContainer = sliderWrapper.parentElement;

    slides.forEach(slide => { slide.style.width = `${100 / totalSlides}%`; });
    sliderWrapper.style.width = `${totalSlides * 100}%`;

    if (totalSlides <= 1) {
        sliderContainer.classList.add('no-slider');
        return;
    }

    const slideUnit = 100 / totalSlides;
    const dots = sliderContainer.querySelectorAll('.dot');

    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let currentIndex = 0;
    let animationID = null;
    let autoSlideInterval = null;

    function updateDots() {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function setSliderPosition() {
        sliderWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
        currentTranslate = -currentIndex * slideUnit;
        prevTranslate = currentTranslate;
        sliderWrapper.style.transition = 'transform 0.3s ease-out';
        setSliderPosition();
        updateDots();
    }

    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            if (!isDragging) {
                goToSlide((currentIndex + 1) % totalSlides);
            }
        }, 5000);
    }

    function onDragStart(event) {
        startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        isDragging = true;
        sliderWrapper.style.transition = 'none';
        clearInterval(autoSlideInterval);
        cancelAnimationFrame(animationID);
        animationID = requestAnimationFrame(function loop() {
            if (isDragging) {
                setSliderPosition();
                animationID = requestAnimationFrame(loop);
            }
        });
    }

    function onDragMove(event) {
        if (!isDragging) return;
        const currentX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        const diff = (currentX - startX) / sliderWrapper.offsetWidth * 100;
        currentTranslate = Math.max(-(totalSlides - 1) * slideUnit, Math.min(0, prevTranslate + diff));
    }

    function onDragEnd() {
        isDragging = false;
        goToSlide(Math.round(-currentTranslate / slideUnit));
        startAutoSlide();
    }

    sliderWrapper.addEventListener('touchstart', onDragStart, { passive: true });
    sliderWrapper.addEventListener('touchmove', onDragMove, { passive: true });
    sliderWrapper.addEventListener('touchend', onDragEnd);
    sliderWrapper.addEventListener('mousedown', onDragStart);
    sliderWrapper.addEventListener('mousemove', onDragMove);
    sliderWrapper.addEventListener('mouseup', onDragEnd);
    sliderWrapper.addEventListener('mouseleave', onDragEnd);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoSlide();
        });
    });

    updateDots();
    startAutoSlide();
}

// ===== 후원자 목록 렌더링 =====

function buildSliderSection(sliderImages) {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';

    sliderImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'slide cover-image';
        img.draggable = false;
        sliderWrapper.appendChild(img);
    });

    if (sliderImages.length > 1) {
        const paginationDots = document.createElement('div');
        paginationDots.className = 'pagination-dots';
        sliderImages.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.setAttribute('data-index', index);
            paginationDots.appendChild(dot);
        });
        sliderContainer.appendChild(paginationDots);
    }

    sliderContainer.appendChild(sliderWrapper);
    return { sliderContainer, sliderWrapper };
}

function buildSectionImage(groupIndex) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'sponsor-image';
    const img = document.createElement('img');
    img.src = `images/image${groupIndex.toString().padStart(2, '0')}.jpg`;
    img.alt = `사진 ${groupIndex}`;
    img.className = 'cover-image';
    imageDiv.appendChild(img);
    return imageDiv;
}

function buildSponsorTable(sponsors) {
    const table = document.createElement('table');
    table.className = 'sponsor-table';
    for (let i = 0; i < sponsors.length; i += 3) {
        const row = table.insertRow();
        for (let j = 0; j < 3 && i + j < sponsors.length; j++) {
            row.insertCell().textContent = sponsors[i + j];
        }
    }
    return table;
}

function wrapNicknamesInSpan() {
    document.querySelectorAll('.sponsor-table td').forEach(cell => {
        cell.innerHTML = `<span class="nickname">${cell.textContent}</span>`;
    });
}

async function loadSponsors() {
    try {
        const allSponsors = window.sponsorsData.sponsors || [];
        const container = document.getElementById('sponsorContainer');
        const sponsorsPerGroup = 99;
        const groupCount = Math.ceil(allSponsors.length / sponsorsPerGroup);

        const sliderImageCount = 3;
        const sliderImages = Array.from({ length: sliderImageCount }, (_, i) =>
            `images/sliderimage${(i + 1).toString().padStart(2, '0')}.jpg`
        );

        let sliderWrapper = null;

        for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
            const section = document.createElement('div');
            section.className = `sponsor-section ${groupIndex}`;

            if (groupIndex === 0) {
                const { sliderContainer, sliderWrapper: wrapper } = buildSliderSection(sliderImages);
                sliderWrapper = wrapper;

                const searchContainer = document.createElement('div');
                searchContainer.className = 'search-container';
                searchContainer.innerHTML = `
                    <input type="text" id="searchInput" placeholder="닉네임으로 검색...">
                    <button id="searchButton">검색</button>
                `;

                section.appendChild(sliderContainer);
                section.appendChild(searchContainer);
            } else if (groupIndex + 1 < groupCount) {
                section.appendChild(buildSectionImage(groupIndex));
            }

            const groupSponsors = allSponsors.slice(groupIndex * sponsorsPerGroup, (groupIndex + 1) * sponsorsPerGroup);
            section.appendChild(buildSponsorTable(groupSponsors));
            container.appendChild(section);
        }

        wrapNicknamesInSpan();
        setupIntersectionObserver();

        if (sliderWrapper) {
            initializeSlider(sliderWrapper);
        }

        document.getElementById('searchButton').addEventListener('click', searchSponsor);
        document.getElementById('searchInput').addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchSponsor();
            }
        });
    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

// ===== 스크롤 / TOP 버튼 =====

function handleScroll() {
    const isScrolled = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
    document.getElementById('topButton').style.opacity = isScrolled ? '1' : '0';
}

// ===== 초기화 =====

function init() {
    document.getElementById('prevResult').addEventListener('click', () => {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    document.getElementById('nextResult').addEventListener('click', () => {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex + 1) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    document.getElementById('closeNavigation').addEventListener('click', () => {
        hideResultNavigation();
        searchResults.forEach(cell => cell.classList.remove('highlight'));
        searchResults = [];
        currentResultIndex = 0;
    });

    document.getElementById('topButton').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('load', loadSponsors);
}

init();