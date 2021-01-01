# Earthquakes Action

Earthquakes Action is Github Action that update firebase when specified earthquakes happened.

## Screenshot

![]()

## Requirements

1. Firebase project
2. Public or private Github repo.

## Usage

1. Fork this repo.
2. 
3. Go to your forked repo's "Settings" tab and navigate to "Secrets" from left sidebar.
4. Create secrets according to your [firebase account]() information:

```bash
# Criteria parameters
CITIES_DELIMITED_WITH_SEMICOLON=BINGOL;BALIKESIR # Or * character for all cities
MIN_MAGNITUDE=4.0
# for debugging purposes
ACTIONS_STEP_DEBUG=true
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)