const fs = require('fs');
const components = require('./components');
const chalk = require('chalk');
const log = console.log;

function turnInterfaceToJson(interfaceParsed, componentName) {
  return interfaceParsed.map((string, i) => {
    let newInterface = '';
    let extendsString = '';
    if (i === 0) {
      newInterface = string.replace(/export interface Props (.*?) ?{/, function(
        c1,
        c2,
      ) {
        extendsString = c2;
        return '[\n\t{';
      });
    } else {
      newInterface = string.replace(/export interface Props (.*?) ?{/, function(c1, c2) {
        extendsString = c2;
        return '\n\t{';
      });
    }

    /* 
      capture group 2 is the prop description, capture group 4 is the name, capture group 5 is the type
    */
    newInterface = newInterface.replace(
      /(\/\*\*\s*([^\*]|\*(?!\/))*\*\/)\s*([_a-zA-Z0-9-]*[?:]?:?[ ]?)(.*);/g,
      function(c1, c2, c3, c4, c5) {
        c4 = c4.replace(':', '');

        if (c5[c5.length - 1] === ',') {
          c5 = c5.substr(0, c5.length - 1);
        }

        let standardString = `\t\t"${c4.trim()}": {
          "type":"${c5}",
          "description": "${c2
            .replace(/\//g, '')
            .replace(/\*/g, '')
            .replace(/(\r\n|\n|\r)/gm, '')
            .trim()}"
        },`;
        return standardString;
      }
    );

    // adding the extends column to the json object
    let interfaceTitle = 'extends';
    let interfaceExtends = [];
    if (extendsString) {
      extendsString = extendsString.replace(/extends/, '');
      interfaceExtends = extendsString.trim().split(',');
    }

    newInterface = newInterface.replace(
      /}$/g,
      `\t\t"${interfaceTitle}":[${interfaceExtends.map(
        (interfaceItem) => `"${interfaceItem.trim()}"`
      )}]\n\t}`
    );

    newInterface = newInterface.replace(/}$/g, '\n\t}\n]');

    return newInterface;
  });
}

function turnTypeToJson(typeParsed) {
  return typeParsed.map((item) => {
    item = item.replace(/'|"/gm, "/'");
    item = item.replace(/export type (\w*) = (.*)/gm, (c1, c2, c3) => {
      if (c3[c3.length - 1] === ',' || c3[c3.length - 1] === ';') {
        c3 = c3.substr(0, c3.length - 1);
      }
      return `"${c2}":"${c3}"`;
    });
    return item;
  });
}

function parseToJson(componentName, path) {
  //creating path
  const combinedPath = path + componentName + '.tsx';
  const text = fs.readFileSync(combinedPath).toString();

  // parsing the file
  const interfaceRe = /export interface[\s\S]*?(?=(.)*}|$)}/g;
  const typeRe = /export type (\w*) = (.*)/g;
  const interfaceParsed = text.match(interfaceRe);
  const typeParsed = text.match(typeRe);

  let newTypes = [];
  //writing the files
  if (typeParsed) {
    //parsing types to json
    newTypes = turnTypeToJson(typeParsed);
  }

  let JSONStrings = turnInterfaceToJson(interfaceParsed, componentName);

  return [JSONStrings, newTypes];
}

function writeFiles() {
  let files = [];
  let success = true;
  let filesWritten = 0;
  components.forEach((item) => {
    const [interfaces, types] = parseToJson(item.name, item.path);
    interfaces.forEach((interfaceItem) => {
      try {
        JSON.parse(interfaceItem);
        success = true;
      } catch (err) {
        success = false;
        if (item.name === 'Dropdown') {
          console.log(interfaceItem);
        }
        log(
          chalk.redBright(
            `There was an error parsing the ${item.name} JSON. Check the component file.`
          )
        );
      }
    });
    if (success) {
      filesWritten++;
      if (types.length > 1) {
        let toBeWritten = '[\n\t{\n\t\t' + types.join('\n\t},\n\t{\n\t\t') + '\n\t}\n]';
        fs.writeFileSync(
          './props/kitchen-type-' + item.name + '.json',
          toBeWritten,
          (error) => {
            if (error) console.log(error);
          }
        );
      }
      let toBeWritten = interfaces.join(',');
      files.push(`import ${item.name}JSON from "./kitchen-props-${item.name}.json"`);
      files.push(`export { ${item.name}JSON }`);

      const dir = './props';
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(
        dir + '/kitchen-props-' + item.name + '.json',
        toBeWritten,
        (error) => {
          if (error) console.log(error);
        }
      );
    }
  });

  fs.writeFileSync('./props/index.js', files.join('\n'));

  console.log('\n\n');
  if (filesWritten !== components.length) {
    log('Components Written:', chalk.redBright(`${filesWritten} / ${components.length}`));
    success = false;
  } else {
    log(
      'Components Written:',
      chalk.greenBright(`${filesWritten} / ${components.length}`)
    );
    success = true;
  }

  console.log('\n');

  log(chalk.greenBright(`"index.js" file generated.\n\n`));

  if (!success) {
    return false;
  } else {
    return true;
  }
}

const start = () => {
  let success = writeFiles();

  if (!success) {
    log(
      chalk.yellowBright(
        'Warning: One or more JSONs failed, not all components will have props on the documentation.'
      )
    );
  } else {
    log(chalk.greenBright('All JSONs parsed correctly! Everything looks good'));
  }
};

start();