function getToc(doc) {
  const headers = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  return headers
    .map(fetchAttributes)
    .map(nestChildren)
    .filter(header => header.level === 1);
}

function fetchAttributes(header, index) {
  return {
    index,
    level: parseInt(header.tagName.charAt(1), 10),
    name: header.textContent.trim(),
    id: header.getAttribute('id'),
    children: [],
  };
}

function nestChildren(header, index, list) {
  // eslint-disable-next-line no-param-reassign
  header.children = getChildren(list, header);
  return header;
}

function getChildren(list, currentRoot) {
  let returnedToLevel = false;

  return list
    .filter(header => {
      if (returnedToLevel || isTheNextHeaderOnSameLevel(header, currentRoot)) {
        returnedToLevel = true;
        return false;
      }

      return true;
    })
    .filter(header => isOneLevelLower(header, currentRoot));
}

function isOneLevelLower(header, currentRoot) {
  return header.level === currentRoot.level + 1 && header.index > currentRoot.index;
}

function isTheNextHeaderOnSameLevel(header, currentRoot) {
  return header.index > currentRoot.index && currentRoot.level === header.level;
}

module.exports = { getToc };
