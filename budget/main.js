(()=>{
    const host = window.location.host
    const isLocal = host.startsWith('localhost')
    const dataSource = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyoZJqTuLIYV0K6MLloGKbo-sj50I-aJVmkWQJCDqW8MdDbf_ogxD7L4C-oKL4nCq3W67wuuZUdxVz/pub?gid=0&single=true&output=csv'

    const localDomain = 'oct'
    const localTemplate = './template.html'
    
    const subdomain = isLocal ? localDomain : host.split('.')[0]
    const templateFile = isLocal ? localTemplate : 'https://static.vdovareize.me/budget/template.html'

    const formatAmount = amount => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    
    let calculatingId;

    const budgetMap = [{
        index: 0,
        sub: 'apt',
        color: '#28792b',
    }, {
        index: 1,
        sub: 'donates',
        color: '#23a6d5',
    }, {
        index: 2,
        sub: 'oct',
        color: '#673ab7',
    }, {
        index: 3,
        sub: 'dent',
        color: '#7f4412',
    }, {
        index: 4,
        sub: 'meow',
        color: '#FA61BC',
    }, {
        index: 5,
        sub: 'bike',
        color: '#d72a2a',
    }]

    const domainData = budgetMap.find(budgetData => budgetData.sub === subdomain)

    const showDiff = (currAmount, lastId) => {
        const diff = currAmount - parseInt(lastId, 10)
        if (isNaN(diff)) {
            return
        }
                
        if (diff !== 0) {
            const diffNode = document.getElementsByClassName('diff')[0]
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

    const getDateString = (timestamp) => {
        const date = new Date(timestamp)
        const day = date.getDate().toString().padStart(2, 0)
        const month = (date.getMonth() + 1).toString().padStart(2, 0)
        const year = date.getFullYear()
        
        return `${day}.${month}.${year}`
    }

    const setData = (data) => {
        clearTimeout(calculatingId)
        const currentData = data[domainData.index]
        storeData(currentData.a)

        const amountNode = document.getElementsByClassName('amount')[0]
        const amountUsdNode = document.getElementsByClassName('amount-usd')[0]
        const sinceNode = document.getElementsByClassName('since')[0]
        const recentNode = document.getElementsByClassName('recent')[0]
        
        amountNode.innerText = `${formatAmount(currentData.a)}`
        if (!!currentData.d) {
            amountUsdNode.innerText = `${formatAmount(currentData.d)}`
        }
        sinceNode.innerText = `since ${getDateString(currentData.s)}`
        recentNode.innerText = `recent ${getDateString(currentData.l)}`
    }

    const csvToJson = (csvString) => {
        const rows = csvString.split('\n')
        const keys = rows.shift().split(',').map(key => key.trim())
        const numberCols = ['a', 'd']
        
        return rows.map(row => {
            const columns = row.split(',').map(key => key.trim())
            return columns.reduce((rowData, column, index) => {
                rowData[keys[index]] = numberCols.includes(keys[index]) ? Number(column) : Date.parse(column)
                return rowData
            }, {})
        })
    }

    const fetchData = () => {
        return fetch(dataSource)
            .then(response => response.text())
            .then(csvToJson)
            .then(setData)
            .catch(error => {
                console.warn(error)

                const numberNode = document.getElementsByClassName('amount')?.[0]
                if (numberNode) {
                    numberNode.innerHTML = '<span>русні пізда</span>'
                }
            })
    }

    const setThemeColor = (color) => {
        if (!color) {
            console.warn('no bg color to set')
            return
        }

        const container = document.getElementsByClassName('container')[0]
        container.style.backgroundColor = color

        const meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.content = color
        document.getElementsByTagName('head')[0].appendChild(meta)
    }

    const runCalculating = (recentNode = document.getElementsByClassName('recent')[0]) => {
        recentNode.innerText = 'calculating'
        animateCalculating(recentNode)
    }

    const animateCalculating = (recentNode) => {
        calculatingId = setTimeout(() => {
            recentNode.innerText = `.${recentNode.innerText}.`
            if (recentNode.innerText.length > 22) {
                runCalculating(recentNode)
            } else {
                animateCalculating(recentNode)
            }
        }, 150)
    }

    const setTemplate = () => {
        return fetch(templateFile)
            .then(response => response.text())
            .then(text => {
                document.getElementsByTagName('body')[0].innerHTML = text
                setThemeColor(domainData.color)
                runCalculating();
            })    
    }

    const run = () => {
        if (domainData === undefined) {
            throw new Error('unknown subdomain')
        }
        
        setTemplate().then(fetchData)
    }

    run()
})()
