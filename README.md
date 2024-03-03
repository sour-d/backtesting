# Back Testing Of Trading strategies

## Setup project

1. `yarn setup`
2. `yarn build`
3. `yarn download`
4. `yarn start` -- it will generate all the trade info in result dir
5. `yarn clean` -- to clean the result and data dir

## How to add strategy
1. Create a new file in `src/strategy`
2. Add the new strategy class and extend `Strategy` class from `src/strategy.js`
3. Import the strategy to `src/index.js` to use it
4. `yarn start` to run the strategy

## How to add more symbols
1. Go to the file called `src/symbolList.json`
2. Add new category if needed
3. Add the symbol with it name
4. Run `yarn download` to re-download all the data mentioned in file
```
NOTE: symbol should match with the name of the symbol in Yahoo Finance.
Otherwise the data will not download.
```
