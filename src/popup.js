import './popup.css';
import createFuzzySearch from '@nozbe/microfuzz';

const tabCardTemplate = document.querySelector('[search-result-template]');
const tabCardContainer = document.querySelector('.search-results');
const searchInput = document.querySelector('#query');
// console.log(searchInput);
const tabsE = [];
var fuzzySearch;

function showTabs(tabs, result = false) {
  const oldTabs = tabCardContainer.querySelectorAll('.search-result');
  for (const tab of oldTabs) {
    tab.remove();
  }
  for (const tab of tabs) {
    const element = tabCardTemplate.content.firstElementChild.cloneNode(true);

    // const title = tab.title;
    // const pathname = tab.url;
    if (!result) {
      const title = tab.title;
      const pathname = tab.url;
      element.querySelector('.title').textContent = title;
      element.querySelector('.url').textContent = pathname;
    } else {
      const title = tab.item.title;
      const pathname = tab.item.url;
      if (tab.matches[0] != null) {
        let prev = 0;
        let finalTitle = '';
        for (const match of tab.matches[0]) {
          finalTitle +=
            title.substring(prev, match[0]) +
            '<mark>' +
            title.substring(match[0], match[1] + 1) +
            '</mark>';

          prev = match[1] + 1;
        }
        finalTitle += title.substring(prev);
        element.querySelector('.title').innerHTML = finalTitle;
      } else {
        element.querySelector('.title').textContent = title;
      }
      if (tab.matches[1] != null) {
        let prev = 0;
        let finalUrl = '';
        for (const match of tab.matches[1]) {
          finalUrl +=
            pathname.substring(prev, match[0]) +
            '<mark>' +
            pathname.substring(match[0], match[1] + 1) +
            '</mark>';

          prev = match[1] + 1;
        }
        finalUrl += pathname.substring(prev);
        element.querySelector('.url').innerHTML = finalUrl;
      } else {
        element.querySelector('.url').textContent = pathname;
      }
    }
    element.addEventListener('click', async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(result ? tab.item.id : tab.id, { active: true });
      await chrome.windows.update(result ? tab.item.windowId : tab.windowId, {
        focused: true,
      });
    });

    tabCardContainer.appendChild(element);
    // tabsE.push(element);
  }
}

chrome.tabs.query({}, (tabs) => {
  // const collator = new Intl.Collator();
  // tabs.sort((a, b) => collator.compare(a.title, b.title));
  tabsE.push(...tabs);
  fuzzySearch = createFuzzySearch(tabsE, {
    // search by `name` property
    // search by multiple properties:
    getText: (item) => [item.title, item.url],
  });
  showTabs(tabsE);
});
// const tabs = tabCardContainer.querySelectorAll('.search-result');

searchInput.addEventListener(
  'input',
  () => {
    const query = searchInput.value.toLowerCase();

    if (query.trim() === '') {
      // for (const tab of tabsE) {
      //   tab.classList.remove('hide');
      // }
      // console.log();
      // tabCardContainer.innerHTML = tabCardContainer.innerHTML.replace(
      //   /<mark>|<\/mark>/g,
      //   ''
      // );
      showTabs(tabsE);
    } else {
      // for (const tab of tabsE) {
      //   tab.classList.add('hide');
      // }
      const results = fuzzySearch(query);
      console.log(results);
      console.log(fuzzySearch);
      showTabs(results, true);
      // for (const result of results) {
      //   result.item.classList.remove('hide');
      //   if (result.matches[0] != null) {
      //     for (const match of result.matches[0]) {
      //       const title = result.item.querySelector('.title').textContent;
      //       result.item.querySelector('.title').innerHTML =
      //         title.substring(0, match[0]) +
      //         '<mark>' +
      //         title.substring(match[0], match[1] + 1) +
      //         '</mark>' +
      //         title.substring(match[1] + 1);
      //     }
      //   }
      //   if (result.matches[1] != null) {
      //     for (const match of result.matches[1]) {
      //       const title = result.item.querySelector('.url').textContent;
      //       result.item.querySelector('.url').innerHTML =
      //         title.substring(0, match[0]) +
      //         '<mark>' +
      //         title.substring(match[0], match[1] + 1) +
      //         '</mark>' +
      //         title.substring(match[1] + 1);
      //     }
      //   }
    }
  }
  // console.log(query);
  // console.log(tabs);
  // console.log(tabsE);

  // for (const tab of tabsE) {
  //   if (query.trim() === '') {
  //     tab.classList.remove('hide');
  //     continue;
  //   }
  //   const title = tab.querySelector('.title').textContent.toLowerCase();
  //   const url = tab.querySelector('.url').textContent.toLowerCase();
  //   if (title.includes(query) || url.includes(query)) {
  //     tab.classList.remove('hide');
  //   } else {
  //     tab.classList.add('hide');
  //   }
  // }
);

window.addEventListener('load', (event) => {
  // tabs = tabCardContainer.querySelectorAll('.search-result');
  searchInput.focus();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.close();
  } else if (event.key === 'ArrowDown') {
    const tabs = tabCardContainer.querySelectorAll('.search-result:not(.hide)');
    // console.log(tabs);
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
