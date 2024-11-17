import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

/**
 * Converts absolute URLs to relative URLs.
 * @param {string} href The absolute URL
 * @returns {string} The relative URL
 */
function convertToRelative(href) {
  const url = new URL(href, window.location.origin);
  return url.pathname + url.search + url.hash;
}

/**
 * Generates a valid id from a relative URL.
 * @param {string} href The relative URL
 * @returns {string} A unique id
 */
function generateId(href) {
  const url = convertToRelative(href);
  return url.replace(/[^\w-]+/g, '_');
}

/**
 * Builds hero block and prepends it to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');

  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates links with relative paths and adds reverse references.
 * @param {Element} main The container element
 */
function decorateLinks(main) {
  const links = main.querySelectorAll('a');
  let linkCounter = 0;

  links.forEach((link) => {
    const { href } = link;

    // Convert to relative URL if within the same domain
    if (href.startsWith(window.location.origin)) {
      link.setAttribute('href', convertToRelative(href));
    }

    // Add unique id if not present
    if (!link.hasAttribute('id')) {
      linkCounter++;
      link.setAttribute('id', `link-${linkCounter}`);
    }

    // Handle internal references
    if (link.hash) {
      const targetId = link.hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const targetParent = targetElement.closest('p');
        if (targetParent) {
          // Locate the citation number within the parent paragraph
          const citationNumberMatch = targetParent.textContent.match(/^\d+\./); // Matches patterns like "2."
          if (citationNumberMatch) {
            const citationNumber = citationNumberMatch[0]; // Extract the citation number
            const anchor = document.createElement('a');
            anchor.href = `#${link.id}`;
            anchor.textContent = citationNumber;
            anchor.className = 'citation-anchor';

            // Replace the citation number in the paragraph with the anchor
            targetParent.innerHTML = targetParent.innerHTML.replace(
              citationNumber,
              anchor.outerHTML
            );

            console.log(`DEBUG: Citation anchor created and assigned for ${citationNumber}`);
          } else {
            console.warn(
              `DEBUG: Citation number not found or anchor not assigned for reference in paragraph: "${targetParent.textContent.trim()}"`
            );
          }
        } else {
          console.warn(
            `DEBUG: Target parent paragraph not found for internal reference: ${targetId}`
          );
        }
      } else {
        console.warn(
          `DEBUG: Target element not found for hash reference: ${link.hash}`
        );
      }
    }
  });
}

/**
 * Converts specific anchor tags to relative URLs and cleans attributes.
 * @param {Element} main The container element
 */
function convertToRelativeUrls(main) {
  const anchors = main.querySelectorAll('a[href*="bookmark-"]');
  anchors.forEach((anchor) => {
    let href = anchor.getAttribute('href');
    const id = anchor.getAttribute('id');

    if (href && href.includes('#')) {
      href = href.substring(href.indexOf('#'));
    }

    while (anchor.attributes.length > 0) {
      anchor.removeAttribute(anchor.attributes[0].name);
    }

    if (href) anchor.setAttribute('href', href);
    if (id) anchor.setAttribute('id', id);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinks(main);
  convertToRelativeUrls(main);
}

/**
 * Loads essential elements for LCP.
 * @param {Element} doc The document container
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
  sampleRUM.enhance();
  if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
    await loadFonts();
  }
}

/**
 * Loads deferred elements.
 * @param {Element} doc The document container
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  if (hash) {
    const element = doc.getElementById(hash.substring(1));
    if (element) element.scrollIntoView();
  }

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
}

/**
 * Loads delayed assets.
 */
function loadDelayed() {
  setTimeout(() => import('./delayed.js'), 3000);
}

/**
 * Main entry point for the page.
 */
async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
