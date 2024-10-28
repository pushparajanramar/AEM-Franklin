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
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
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
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// Helper function to convert absolute URLs to relative
function convertToRelative(href) {
  const url = new URL(href, window.location.origin);
  return url.pathname + url.search + url.hash;
}

// Helper function to generate a valid id from the relative URL
function generateId(href) {
  const url = convertToRelative(href);
  return url.pathname.replace(/[^\w-]+/g, '_') + url.search.replace(/[^\w-]+/g, '_') + url.hash.replace(/[^\w-]+/g, '_');
}


function decorateLinks(main) {
  const links = main.querySelectorAll('a');
  
  function convertToRelative(href) {
      if (!href.startsWith(window.location.origin)) return href; // Already relative
      const url = new URL(href, window.location.origin);
      return url.pathname + url.search + url.hash;
  }

  let linkCounter = 0;

  links.forEach((link) => {
      const { href, hash } = link;

      // Convert to relative URL if within the same domain
      if (href.startsWith(window.location.origin)) {
          link.setAttribute('href', convertToRelative(href));
      }

      // Add unique ID if not present
      if (!link.hasAttribute('id')) {
          linkCounter++;
          link.setAttribute('id', `link-${linkCounter}`);
      }
      
      // If the link has a hash (internal reference)
      if (hash) {
          const targetId = hash.slice(1); // Remove '#' from the hash
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
              // Match and wrap the citation number with a reverse link
              const citationText = targetElement.textContent;
              const firstSentenceMatch = citationText.match(/^(\d+\.)/);

              if (firstSentenceMatch) {
                  const referenceNumber = firstSentenceMatch[0].trim();
                  const reverseLink = document.createElement('a');
                  reverseLink.href = `#${link.id}`;
                  reverseLink.textContent = referenceNumber;
                  reverseLink.classList.add('reference-link'); // Add class for styling

                  // Wrap the reference number in the target paragraph with reverse link
                  targetElement.innerHTML = `${reverseLink.outerHTML} ${citationText.replace(referenceNumber, '')}`;
              }
          }
      }
  });
}











/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
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

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
