App name: Infobae  
Framework: React Native with TypesScript and Expo  
Platform: Android and iOS  
App purpose: A mobile news reader app that serves content from Infobae  
Content types: Text articles, Videos, Live streams, audio  

APIs: for now, just reverse engineer the infobae.com website and use the public APIs the website is using.
Editions: Infobae has different editions for each different country that it covers. For example: World, US, Argentina, Colombia, Spain...

Navigation:  
Bottom tabs: Home, My Infobae, Media, Chat, Menu
First launch: ask the user to select a preferred news edition. This should be persisted in local user prefs.  
Home tab: Display a vertical scrolling feed of news articles from the user's currently selected edition.  
Menu: Allow the user to change their selected edition.
Article Detail: When the user taps on an article from any news feed, display the article header, text, and image embeds.  

Requirements:  
Localization: all user-facing strings should be kept in a separate json file for easy translation.  
Design System: Create a module that houses a design system to ensure the whole app, along with future feature work, all conform to a coherent design look and feel. The design system should contain fonts, color, styles/themes, and reusable views/components. All UI/screens in the app should use components from the design system. when building a screen that uses views not represented in the design system, first create a new component in the design system, then use that new component to build the screen. One-off views should be rare and only used in special truly-unique circumstances.  
Static analysis: A linter should be installed to ensure that all committed code follows a standard code style.  
Test automation: All business logic should be tested with unit tests. All screens should be tested for regressions using Maestro Visual Testing (screenshot testing). All unit tests should be run before pushing a feature branch. All Maestro tests should be run before merging a PR.  