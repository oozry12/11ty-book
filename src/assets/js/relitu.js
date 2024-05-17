function parseDate(str) {
    return new Date(str);
}

function getThisSunday(date) {
    const dayOfWeek = date.getDay();
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const thisSunday = new Date(date);
    thisSunday.setDate(thisSunday.getDate() + daysToSunday);
    return thisSunday;
}

const today = new Date();
const sunday = getThisSunday(today);
let startDate = new Date(sunday);
startDate.setDate(sunday.getDate() - 62);

function dateBuild(data) {
    const dateCounts = {};
    data.forEach((item) => {
        const dateStr = parseDate(item.date).toISOString().split("T")[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    const result = [];
    for (
        let currentDate = sunday;
        currentDate >= startDate;
        currentDate.setDate(currentDate.getDate() - 1)
    ) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = dateCounts[dateStr] || 0;
        const dataContent = data.filter(
            (item) =>
                parseDate(item.date).toISOString().split("T")[0] === dateStr
        );

        result.push({
            date: dateStr,
            count: count,
            data: dataContent,
        });
    }

    result.forEach((item) => {
        var sumOfWordcounts = item.data.reduce((accumulator, currentItem) => {
            return (accumulator = currentItem.word_count || 0);
        }, 0);
        item.wordcount = sumOfWordcounts;
    });

    return result;
}

export default function fillGrid(data) {
    let articles = dateBuild(data);
    const gridContainer = document.getElementById("relitu-container");
    const gridItemTemplate = document.createElement("div");
    gridItemTemplate.className = "grid-item";

    articles
        .slice()
        .reverse()
        .forEach((article, index) => {
            const gridItem = gridItemTemplate.cloneNode(false);
            const tooltipStr = article.data
                .map(
                    (item, i) =>
                        `- <a href='${item.href}'>${item.title}</a></br>`
                )
                .join(" ");
            gridItem.innerHTML = `<div style="${ article.wordcount != 0 ? `background-color:rgba(77, 208, 90,${article.wordcount / 5000 + 0.2})`:""}" 
            class="item-info ${ article.count != 0 ? `item-tippy" data-tippy-content="共 ${article.count} 篇，共 ${article.wordcount} 字<br />${tooltipStr}"`:'"' } data-date="${article.date}"></div>`;

            const colIndex = Math.floor(index / 7);
            const rowIndex = index % 7;

            if (rowIndex === 0) {
                const gridColumn = document.createElement("div");
                gridColumn.className = "grid-column";
                gridContainer.appendChild(gridColumn);
            }
            const gridColumns = document.getElementsByClassName("grid-column");
            if (gridColumns[colIndex]) {
                gridColumns[colIndex].append(gridItem);
            } else {
                // 如果列索引超出了当前已有的列，需要创建新的列
                const newColumn = document.createElement("div");
                newColumn.className = "grid-column";
                gridContainer.appendChild(newColumn);
                newColumn.append(gridItem);
            }
        });
}
