# 4thgenspeedrun

## VSCode + clasp setup
Source: https://stackoverflow.com/questions/48983003/google-app-script-desktop-ide

1. Install clasp (https://developers.google.com/apps-script/guides/clasp)

1. <pre>clasp login</pre>

1. Set Google Application Script API to "On" (https://script.google.com/home/usersettings)

1. <pre>clasp clone $script-id</pre>
    * `$script-id` : Left Menu -> Project Settings -> IDs

1. Set up git version control

1. <pre>npm i @types/google-apps-script</pre>
    * Run in the same directory that you cloned the script

1. Edit the script project in VSCode

1. <pre>clasp push</pre>