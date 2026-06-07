// @ts-nocheck
// 🎮 CodinGame Puzzle - parse-sql-queries
// https://www.codingame.com/training/hard/parse-sql-queries

const query: string = readline();
const rows: number = parseInt(readline());
const columnNames: string[] = readline().split(' ');

const tableRows: Record<string, string>[] = [];
for (let i = 0; i < rows; i++) {
    const values: string[] = readline().split(' ');
    const row: Record<string, string> = {};
    for (let j = 0; j < columnNames.length; j++) {
        row[columnNames[j]] = values[j];
    }
    tableRows.push(row);
}

// Parse the SQL query
// Format: SELECT col1,col2 FROM table [WHERE col = val] [ORDER BY col ASC|DESC]
const queryUpper: string = query.toUpperCase();

// Extract SELECT columns
const fromIdx: number = queryUpper.indexOf(' FROM ');
const selectPart: string = query.substring(7, fromIdx).trim(); // after "SELECT "
let selectedColumns: string[];
if (selectPart === '*') {
    selectedColumns = [...columnNames];
} else {
    selectedColumns = selectPart.split(',').map((c: string) => c.trim());
}

// Extract the rest after FROM tableName
const afterFrom: string = query.substring(fromIdx + 6).trim();
const afterFromUpper: string = afterFrom.toUpperCase();

// Check for WHERE and ORDER BY
let whereCol: string | null = null;
let whereVal: string | null = null;
let orderCol: string | null = null;
let orderDir: string | null = null;

const whereIdx: number = afterFromUpper.indexOf(' WHERE ');
const orderIdx: number = afterFromUpper.indexOf(' ORDER BY ');

if (orderIdx !== -1) {
    const orderPart: string = afterFrom.substring(orderIdx + 10).trim();
    const orderParts: string[] = orderPart.split(' ');
    orderCol = orderParts[0];
    orderDir = orderParts[1].toUpperCase();
}

if (whereIdx !== -1) {
    const whereEnd: number = orderIdx !== -1 ? orderIdx : afterFrom.length;
    const wherePart: string = afterFrom.substring(whereIdx + 7, whereEnd).trim();
    const eqIdx: number = wherePart.indexOf(' = ');
    whereCol = wherePart.substring(0, eqIdx).trim();
    whereVal = wherePart.substring(eqIdx + 3).trim();
}

// Filter rows
let filteredRows: Record<string, string>[] = tableRows;
if (whereCol !== null && whereVal !== null) {
    const wCol: string = whereCol;
    const wVal: string = whereVal;
    filteredRows = filteredRows.filter((row: Record<string, string>) => row[wCol] === wVal);
}

// Sort rows
if (orderCol !== null) {
    const oCol: string = orderCol;
    const oDir: string = orderDir!;
    filteredRows.sort((a: Record<string, string>, b: Record<string, string>) => {
        const aVal: number = parseFloat(a[oCol]);
        const bVal: number = parseFloat(b[oCol]);
        return oDir === 'ASC' ? aVal - bVal : bVal - aVal;
    });
}

// Output
console.log(selectedColumns.join(' '));
for (const row of filteredRows) {
    console.log(selectedColumns.map((col: string) => row[col]).join(' '));
}
