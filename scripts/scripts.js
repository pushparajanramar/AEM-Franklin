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
  // Get all <a> tags within the main container
  const links = main.querySelectorAll('a');

  // Helper function to convert absolute URLs to relative
  function convertToRelative(href) {
      const url = new URL(href, window.location.origin);
      return url.pathname + url.search + url.hash;
  }

  // Counter to generate unique ids specifically for <sup> links
  let supLinkCounter = 0;

  // Loop through each anchor element
  links.forEach((link) => {
      const { href, id, title } = link;

      // Proceed only if the <a> tag has a <sup> child
      const supTag = link.querySelector('sup');
      if (!supTag) return;

      // Convert to relative URL if the link is within the same domain
      if (href.startsWith(window.location.origin)) {
          const relativeHref = convertToRelative(href);
          link.setAttribute('href', relativeHref);
      }

      // Increment counter and create a unique id for each link within <sup> tags
      supLinkCounter++;
      const uniqueSupId = `sup-link-${supLinkCounter}`;

      // Check if there's already an anchor inside <sup>
      if (!supTag.querySelector('a')) {
          // Create a new <a> tag around the content of <sup>
          const newLink = document.createElement('a');
          newLink.href = `#${uniqueSupId}`;
          newLink.textContent = supTag.textContent.trim();
          newLink.style.color = '#007bff'; // Optional styling for visibility

          // Clear the original <sup> content and append the new <a> tag
          supTag.innerHTML = '';
          supTag.appendChild(newLink);
      }

      // Set a unique ID for the original link if it doesn't have one
      if (!link.id) {
          link.setAttribute('id', uniqueSupId);
      }

      // Additional functionality: Get the parent <p> tag of the current link
      const parentParagraph = link.closest('p');

      if (parentParagraph) {
          // Extract the reference number (e.g., "93.") from the beginning of the paragraph
          const paragraphText = parentParagraph.textContent;
          const firstSentenceMatch = paragraphText.match(/^(\d+\.)/);

          if (firstSentenceMatch) {
              const referenceNumber = firstSentenceMatch[0].trim();

              // Check if there's already an <a> tag with this reference number
              const existingReferenceLink = parentParagraph.querySelector(`a[href="#${uniqueSupId}"]`);

              if (!existingReferenceLink) {
                  // Create a new <a> tag to wrap the reference number
                  const referenceLink = document.createElement('a');
                  referenceLink.href = `#${uniqueSupId}`;
                  referenceLink.textContent = referenceNumber;
                  referenceLink.style.color = '#007bff';

                  // Replace the reference number text in the paragraph with the new <a> tag
                  parentParagraph.innerHTML = parentParagraph.innerHTML.replace(referenceNumber, referenceLink.outerHTML);
              }
          }

          // Create a reverse link based on the first sentence of the paragraph text
          const firstSentence = parentParagraph.textContent.split('.')[0].trim();
          const existingLink = Array.from(parentParagraph.querySelectorAll('a')).find(
              (a) => a.textContent.trim() === firstSentence
          );

          if (!existingLink && firstSentence) {
              const reverseRef = document.createElement('a');
              reverseRef.href = `#${uniqueSupId}`;
              reverseRef.textContent = firstSentence;
              reverseRef.style.display = 'block';
              reverseRef.style.fontSize = '0.9em';
              reverseRef.style.color = '#007bff';

              parentParagraph.insertBefore(reverseRef, parentParagraph.firstChild);
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
