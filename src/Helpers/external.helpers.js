import clone from 'just-clone';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const readCsv = async (file) => {
  if (!file) {
    return;
  }

  return fetch(file)
    .then((response) => response.text())
    .then((text) => JSON.parse(text));
};

export const get40KData = async () => {
  const dataDatasheetAbilities = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_abilities.json'
  );
  const dataStratagems = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Stratagems.json'
  );
  const dataAbilities = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Abilities.json'
  );
  const dataDatasheetWargear = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_wargear.json'
  );
  const dataWargearList = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Wargear_list.json'
  );
  const dataWargear = await readCsv('https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Wargear.json');
  const dataModels = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_models.json'
  );
  const dataKeywords = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_keywords.json'
  );
  const dataDamage = await readCsv(
    'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_damage.json'
  );
  const dataFactions = await readCsv('https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Factions.json');
  const sheets = await readCsv('https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets.json');

  const mappedStratagems = dataStratagems.map((stratagem) => {
    stratagem['cardType'] = 'stratagem';
    return stratagem;
  });

  const mappedSheets = sheets.map((row) => {
    row['cardType'] = 'datasheet';
    row['keywords'] = [
      ...new Map(
        dataKeywords
          .filter((keyword) => keyword.datasheet_id === row.id)
          .map((model) => {
            return { ...model, active: true };
          })
          .map((item) => [item['keyword'], item])
      ).values(),
    ];
    row['datasheet'] = dataModels
      .filter((model) => model.datasheet_id === row.id)
      .filter(onlyUnique)
      .map((model, index) => {
        return { ...model, active: index === 0 ? true : false };
      });

    const linkedDamageTable = dataDamage.filter((damage) => damage.datasheet_id === row.id);
    for (let index = 1; index < linkedDamageTable.length; index++) {
      const cols = linkedDamageTable[0];
      const newRow = {};

      newRow['W'] = linkedDamageTable[index]['Col1'];
      newRow[cols['Col2']] = linkedDamageTable[index]['Col2'];
      newRow[cols['Col3']] = linkedDamageTable[index]['Col3'];
      newRow[cols['Col4']] = linkedDamageTable[index]['Col4'];
      if (cols['Col5']) {
        newRow[cols['Col5']] = linkedDamageTable[index]['Col5'];
      }
      row['datasheet'].push(newRow);
    }

    const linkedWargear = [
      ...new Map(
        dataDatasheetWargear
          .filter((wargear) => wargear.datasheet_id === row.id && wargear.is_index_wargear === 'false')
          .map((item) => [item['wargear_id'], item])
      ).values(),
    ];

    row['wargear'] = [];
    linkedWargear.forEach((wargear, index) => {
      row['wargear'][index] = clone(dataWargear.find((gear) => gear.id === wargear.wargear_id));
      if (row['wargear'][index]) {
        row['wargear'][index]['active'] = index === 0 ? true : false;
        row['wargear'][index]['profiles'] = clone(
          dataWargearList.filter((wargearList) => wargearList.wargear_id === wargear.wargear_id)
        );
      }
    });
    const linkedAbilities = dataDatasheetAbilities.filter((ability) => ability.datasheet_id === row.id);
    row['abilities'] = [];
    linkedAbilities.forEach((ability, index) => {
      row['abilities'].push(dataAbilities.find((abilityInfo) => abilityInfo.id === ability.ability_id));
    });
    row['abilities'] = row['abilities'].map((ability, index) => {
      return { ...ability, showDescription: false, showAbility: index === 0 ? true : false };
    });
    return row;
  });
  mappedSheets.shift();
  dataFactions.map((faction) => {
    faction['datasheets'] = mappedSheets
      .filter((datasheet) => datasheet.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction['stratagems'] = mappedStratagems
      .filter((stratagem) => stratagem.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    return faction;
  });

  return dataFactions;
};
