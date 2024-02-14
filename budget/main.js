(()=>{
    // const subdomain = window.location.hostname.split('.').slice(0, -2).join('.') || 'root';
    const subdomain = 'root';

    const formatAmount = amount => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    const showDiff = (currAmount, lastId) => {
        const diff = currAmount - parseInt(lastId, 10)
        if (isNaN(diff)) {
            return
        }
                
        if (diff !== 0) {
            const diffNode = document.getElementsByClassName('painful-diff')[0]
            let formattedDiff = formatAmount(diff)
            if (diff > 0) {
                formattedDiff = `+${formattedDiff}`
            }

            diffNode.innerText = `${formattedDiff} since last visit`
        }
    }

    const storeData = (amount) => {
        const lastId = localStorage.getItem(`${subdomain}-lastId`)
        
        if (isNaN(lastId) || parseInt(lastId, 10) !== amount) {
            if (lastId && !isNaN(lastId)) {
                showDiff(amount, lastId)
                localStorage.setItem(`${subdomain}-mediateId`, lastId)
            }
            localStorage.setItem(`${subdomain}-lastId`, amount)
            localStorage.setItem(`${subdomain}-lastUpdate`, Date.now())
        } else if (parseInt(lastId, 10) === amount) {
            const lastUpdate = localStorage.getItem(`${subdomain}-lastUpdate`)
            const timeDiff = (Date.now() - lastUpdate)
            if (timeDiff < 10 * 60 * 1000) {
                showDiff(amount, localStorage.getItem(`${subdomain}-mediateId`))
            }
        }
    }

    const setData = (data) => {
        console.log('data', data)
        storeData(data.id);
        const numberNode = document.getElementsByClassName('painful-number')[0]
        const dateNode = document.getElementsByClassName('painful-date')[0]
        
        const date = new Date(parseInt(data.last_updated, 10) * 1000)
        const day = date.getDate().toString().padStart(2, 0)
        const month = (date.getMonth() + 1).toString().padStart(2, 0)
        const year = date.getFullYear()

        numberNode.innerText = formatAmount(data.id)
        dateNode.innerText = `${day}.${month}.${year}`
    }

    const csvToJson = (csvString) => {
        const rows = csvString.split('\n');
        const keys = rows.shift().split(',').map(key => key.trim())
        
        return rows.map(row => {
          const columns = row.split(',').map(key => key.trim());
          return columns.reduce((rowData, column, index) => {
            rowData[keys[index]] = keys[index] === 'amount' ? Number(column) : Date.parse(column)
            return rowData;
          }, {});
        });
      };

    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyoZJqTuLIYV0K6MLloGKbo-sj50I-aJVmkWQJCDqW8MdDbf_ogxD7L4C-oKL4nCq3W67wuuZUdxVz/pub?gid=0&single=true&output=csv'
    fetch(url)
        .then(response => response.text())
        .then(csvToJson)
        .then(setData)
        .catch(error => {
            console.error(error)
            const numberNode = document.getElementsByClassName('painful-number')?.[0]
            if (numberNode) {
                numberNode.innerHTML = '<span>русні пізда</span>'
            }
        })
})()