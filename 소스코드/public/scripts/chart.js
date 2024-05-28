async function showChart(core, task, chartType) {
    const response = await fetch('/data');
    const data = await response.json();

    const coreIndex = data.cores.indexOf(core);
    const stats = data.stats[task][coreIndex];

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: ['Min', 'Max', 'Avg'],
            datasets: [{
                label: `${core} - ${task}`,
                data: [stats.min, stats.max, stats.avg],
                backgroundColor: ['red', 'blue', 'green'],
            }]
        },
        options: {}
    });
}

