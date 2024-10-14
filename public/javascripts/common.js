document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('liveSearchInput');

    searchInput.addEventListener('input', debounce(async function() {
        const query = searchInput.value.trim();
        console.log("Searching for: ", query); // Log the query being searched for debugging

        fetch(`/live-search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const resultsTable = document.getElementById('resultsTable');
            resultsTable.innerHTML = ''; // Clear current results
    
            data.forEach((headline, index) => { // Added index here
                const highlightedText = query
                    ? headline.text.replace(new RegExp(query, "gi"), match => `<span class="highlight">${match}</span>`)
                    : headline.text;
    
                const row = document.createElement('tr');
    
                const actionCell = document.createElement('td');
                const addButton = document.createElement('button');
                addButton.className = "btn btn-primary btn-sm add-to-my-news";
                addButton.setAttribute('name', 'add-to-my-news');
                addButton.setAttribute('data-headline-id', index); // Now index is correctly provided
                addButton.textContent = 'Add';
                actionCell.appendChild(addButton);
    
                const titleCell = document.createElement('td');
                titleCell.className = "newstitle";
    
                titleCell.innerHTML = `<a class="news-link" href="${headline.url}" target="_blank">${highlightedText}</a>
                                       <span style="font-size:smaller; color:white;background-color: blue;">${headline.source}</span>`;
    
                // Append cells to the row
                row.appendChild(actionCell);
                row.appendChild(titleCell);
    
                resultsTable.appendChild(row);
            });
        })
        .catch(error => console.error('Fetching error:', error));
            
    }, 300));
});

function debounce(func, wait) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}