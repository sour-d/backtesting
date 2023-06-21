# Back Testing Of Trading strategies

## Setup project

1. `npm run setup`
2. `npm run download`
3. `npm start` -- it will generate all the trade info in result dir
4. `npm run serve` -- to see the result in web browser
5. `npm run clean` -- to clean the result and data dir

## How to add strategy
1. Create a new file in `src/strategy`
2. Add the new strategy class and extend `Strategy` class from `src/strategy.js`
3. Import the strategy to `src/index.js` to use it
4. `npm start` to generate the result
5. `npm run serve` to see the result in web browser

## How to add more symbols
1. Go to the file called `src/symbolList.json`
2. Add new category if needed
3. Add the symbol with it name
4. Run `npm run download` to re-download all the data mentioned in file
```
NOTE: symbol should match with the name of the symbol in Yahoo Finance.
Otherwise the data will not download.
```
