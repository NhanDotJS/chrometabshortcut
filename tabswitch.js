function scroll(amount) {
  var element =
    window.location.origin === "https://docs.google.com"
      ? document.querySelector(".kix-appview-editor")
      : window;
  element =
    window.location.origin === "https://www.messenger.com"
      ? document.querySelector("div[aria-label^='Messages in conversation']")
          .firstElementChild.firstElementChild
      : element;
  // console.log(element);
  var scrollTop =
    element.pageYOffset !== undefined
      ? element.pageYOffset
      : (
          element ||
          document.documentElement ||
          document.body.parentNode ||
          document.body
        ).scrollTop;
  // console.log(scrollTop);
  element.scrollTo({
    top: scrollTop + amount,
    behavior: "instant",
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  const allTabs = await chrome.tabs.query({ currentWindow: true });
  const currentTab = allTabs.find((tab) => tab.active);

  if (command == "next-tab" && allTabs) {
    let nextTabIndex = currentTab.index + 1;
    if (nextTabIndex >= allTabs.length) {
      nextTabIndex = 0;
    }
    chrome.tabs.update(allTabs[nextTabIndex].id, { active: true });
    // console.log("Next");
  } else if (command == "previous-tab" && allTabs) {
    let prevTabIndex = currentTab.index - 1;
    if (prevTabIndex < 0) {
      prevTabIndex = allTabs.length - 1;
    }
    chrome.tabs.update(allTabs[prevTabIndex].id, { active: true });
    // console.log("BAck");
  } else if (command == "scroll-up") {
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      args: [-600],
      func: scroll,
    });
  } else if (command == "scroll-down") {
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      args: [600],
      func: scroll,
    });
  } else if (command == "open-popup") {
    chrome.action.openPopup();
  }
});
