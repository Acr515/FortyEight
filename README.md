# FortyEight
A robot-scouting web browser program for FIRST Robotics Competition teams created using a webpack-managed React.js framework.

FortyEight is intended to improve upon a prior scouting program 4855scout (https://github.com/FRCTeam4855/4855scout) by retaining its core features (no internet required, data passed from different devices via .json files) while improving various aspects and adding new features including graphs, enhanced UI, and the power of package integration and React.js to make development and updates easier than ever.

## Development
Install dependencies and begin a development server. The app will be accessible at `localhost:8080/`.
```
cd FortyEight
npm install
npm start
```

## Production
To export out standalone files that can run without a development server:
```
npm run build
```
The build will populate inside the `build` directory. Open the `index.html` file in your browser to launch.


## Usage
Match data can be created using the Create tab on the left of the screen. Matches created can be viewed under the Teams tab, where teams can be analyzed based on their individual performance game-to-game. Use the Manage tab to export .json files containing all the information you've collected, as well as import .json files created by fellow scouts to include in your own data sets.
