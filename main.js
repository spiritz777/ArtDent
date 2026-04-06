document.addEventListener("DOMContentLoaded", () => {
    // === 1. Navbar Sticky Effect & Active State ===
    const header = document.getElementById("header");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Active Navigation Link Update
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });

    // === 2. Scroll to Top Button ===
    const scrollTopBtn = document.getElementById("scroll-to-top");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add("visible");
        } else {
            scrollTopBtn.classList.remove("visible");
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // === 3. Intersection Observer for Fade-in Animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach(el => {
        scrollObserver.observe(el);
    });

    // === 4. Fetch and Parse prices.txt ===
    const pricesContainer = document.getElementById("prices-container");

    async function loadPrices() {
        try {
            pricesContainer.innerHTML = '<div class="loader-msg">Бағалар жүктелуде...</div>';

            const response = await fetch("prices.txt");
            if (!response.ok) throw new Error("Не удалось загрузить файл прайса.");

            const text = await response.text();
            parsePrices(text);
        } catch (error) {
            pricesContainer.innerHTML = `
                <div class="error-msg">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <p>Бағаларды жүктеу кезінде қате орын алды.<br>Браузерлер жергілікті файлдарды оқуды бұғаттайтындықтан, сайтты жергілікті сервер арқылы (мысалы, Live Server) іске қосыңыз.</p>
                    <small>Детали: ${error.message}</small>
                </div>
            `;
        }
    }

    function parsePrices(text) {
        const lines = text.split(/\r?\n/);
        pricesContainer.innerHTML = ""; // Clear loader

        let currentCategory = null;
        let currentList = null;
        let delayIndex = 0; // For animation stagger

        // Allowed separators for Split
        const sepPattern = /\s*[-:]\s*/;

        lines.forEach(line => {
            const raw = line.trim();
            if (!raw) return; // Skip empty lines

            // If a line is all uppercase and doesn't explicitly contain numbers/separators, treat as Category Title.
            // Example "ТЕРАПИЯ", "ОРТОПЕДИЯ"
            const isCategory = raw === raw.toUpperCase() && !raw.match(/\d/);

            if (isCategory) {
                // Create new category card
                currentCategory = document.createElement("div");
                currentCategory.className = "price-card";
                currentCategory.style.animationDelay = `${delayIndex * 0.15}s`;
                delayIndex++;

                const title = document.createElement("h3");
                title.className = "price-category-title";
                title.textContent = raw;
                currentCategory.appendChild(title);

                currentList = document.createElement("ul");
                currentList.className = "price-list";
                currentCategory.appendChild(currentList);

                pricesContainer.appendChild(currentCategory);
            } else {
                // It's a service item
                if (!currentList) {
                    console.warn("Orphaned price item found: ", raw);
                    return; // Skip if no category is defined
                }

                // Try splitting
                const parts = raw.split(sepPattern);
                const li = document.createElement("li");
                li.className = "price-item";

                let nameStr = raw;
                let valueStr = "";

                if (parts.length > 1) {
                    nameStr = parts[0].trim();
                    // Rejoin the rest in case there were multiple dash characters e.g., "18.000-30.000"
                    valueStr = parts.slice(1).join(" - ").trim();
                }

                li.innerHTML = `
                    <span class="price-name">${nameStr}</span>
                    <span class="price-value">${valueStr} ₸</span>
                `;
                currentList.appendChild(li);
            }
        });
    }

    // Initialize prices fetch
    loadPrices();
});
