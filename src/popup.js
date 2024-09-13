import './popup.css';

const tabCardTemplate = document.querySelector('[search-result-template]');
const tabCardContainer = document.querySelector('.search-results');
const searchInput = document.querySelector('#query');
// console.log(searchInput);

chrome.tabs.query({}, (tabs) => {
  const collator = new Intl.Collator();
  tabs.sort((a, b) => collator.compare(a.title, b.title));
  for (const tab of tabs) {
    const element = tabCardTemplate.content.firstElementChild.cloneNode(true);

    const title = tab.title;
    const pathname = new URL(tab.url);

    element.querySelector('.title').textContent = title;
    element.querySelector('.url').textContent = pathname;
    element.addEventListener('click', async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    tabCardContainer.appendChild(element);
  }
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  // console.log(query);
  const tabs = tabCardContainer.querySelectorAll('.search-result');

  for (const tab of tabs) {
    if (query.trim() === '') {
      tab.classList.remove('hide');
      continue;
    }
    const title = tab.querySelector('.title').textContent.toLowerCase();
    const url = tab.querySelector('.url').textContent.toLowerCase();
    if (title.includes(query) || url.includes(query)) {
      tab.classList.remove('hide');
    } else {
      tab.classList.add('hide');
    }
  }
});

window.addEventListener('load', (event) => {
  searchInput.focus();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.close();
  } else if (event.key === 'ArrowDown') {
    const tabs = tabCardContainer.querySelectorAll('.search-result:not(.hide)');
    console.log(tabs);
    const currentE = document.activeElement;
    if (Array.from(tabs).includes(currentE)) {
      const currentIndex = Array.from(tabs).indexOf(currentE);
      const nextIndex = currentIndex + 1;
      console.log(nextIndex);
      if (nextIndex < tabs.length) {
        console.log(tabs[nextIndex]);
        tabs[nextIndex].focus();
      } else {
        tabs[0].focus();
      }
    } else {
      try {
        tabs[0].focus();
      } catch (error) {
        console.log(error);
      }
    }
  } else if (event.key === 'ArrowUp') {
    const tabs = tabCardContainer.querySelectorAll('.search-result:not(.hide)');
    const currentE = document.activeElement;
    if (Array.from(tabs).includes(currentE)) {
      const currentIndex = Array.from(tabs).indexOf(currentE);
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        tabs[prevIndex].focus();
      } else {
        tabs[tabs.length - 1].focus();
      }
    } else {
      tabs[tabs.length - 1].focus();
    }
  } else if (event.key === 'Enter') {
    const currentE = document.activeElement;
    if (currentE === searchInput) {
      const tab = tabCardContainer.querySelector('.search-result:not(.hide)');
      tab.click();
    }
    currentE.click();
    window.close();
  } else if (event.key == '/') {
    searchInput.focus();
  }
});
