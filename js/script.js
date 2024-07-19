"use strict";

document.addEventListener('DOMContentLoaded', function() {
    const dataTable = document.getElementById('dataTable');
    const dataBody = document.getElementById('dataBody');
    const filterInput = document.getElementById('filterInput');
    const filterAmountInput = document.getElementById('filterAmountInput');
    const ctx = document.getElementById('transactionChart').getContext('2d');
    let chart;

    let customers = [];
    let transactions = [];

    // Fetch data from data.json
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => {
            customers = data.customers;
            transactions = data.transactions;
            displayTable(customers, transactions);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    filterInput.addEventListener('input', filterTable);
    filterAmountInput.addEventListener('input', filterTable);

    function filterTable() {
        const filterValue = filterInput.value.toLowerCase();
        const filterAmountValue = filterAmountInput.value.toLowerCase();

        const filteredTransactions = transactions.filter(transaction => {
            const customerName = customers.find(customer => customer.id === transaction.customer_id).name.toLowerCase();
            const amount = transaction.amount.toString().toLowerCase();

            const nameMatch = customerName.includes(filterValue);
            const amountMatch = amount.includes(filterAmountValue);

            return nameMatch && amountMatch;
        });

        displayTable(customers, filteredTransactions);

        // Optional: Reset chart when filter changes
        // updateChart(); // Uncomment this line if you want to reset chart on filter change
    }

    function displayTable(customers, transactions) {
        dataBody.innerHTML = '';
        transactions.forEach(transaction => {
            const customerName = customers.find(customer => customer.id === transaction.customer_id).name;
            const row = 
                `<tr class="hover:bg-gray-800" data-customer-id="${transaction.customer_id}">
                    <td class="px-6 py-4 whitespace-nowrap">${customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${transaction.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${transaction.amount}</td>
                </tr>`;
            dataBody.innerHTML += row;
        });
    }

    function updateChart(customerId) {
        if (chart) {
            chart.destroy();
        }

        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
        const totalAmounts = dates.map(date => {
            return customerTransactions.filter(transaction => transaction.date === date)
                .reduce((acc, curr) => acc + curr.amount, 0);
        });

        const customer = customers.find(customer => customer.id === customerId);
        const customerName = customer ? customer.name : 'Undefined User';

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: `Total Amount Of ${customerName}`,
                    data: totalAmounts,
                    backgroundColor: '#3182ce',
                    borderColor: '#3182ce',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }   

    // Event listener for table row click (to update chart)
    dataTable.addEventListener('click', function(event) {
        if (event.target.tagName === 'TD') {
            const row = event.target.parentNode;
            const customerId = parseInt(row.getAttribute('data-customer-id'));
            updateChart(customerId);

            // Optional: Highlight the clicked row if needed
            const rows = document.querySelectorAll('#dataTable tbody tr');
            rows.forEach(row => row.classList.remove('bg-gray-800'));
            row.classList.add('bg-gray-800');
        }
    });

    // Default Chart Text
    const canvas = document.querySelector('canvas');
    const ctxChartText = canvas.getContext('2d');
    // Font Size
    ctxChartText.font = '30px Arial';
    // Center text
    ctxChartText.textAlign = 'center';
    // Color white
    ctxChartText.fillStyle = 'white';
    // Draw text
    ctxChartText.fillText('Select One To Get Data', canvas.width / 2, canvas.height / 2);

});
