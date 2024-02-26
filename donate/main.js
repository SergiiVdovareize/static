(()=>{
    const RESET_TIMEOUT = 10000
    const COPY_VIBRATION_TIME = 50
    const copiedDescriptionElement = document.getElementById('copied-description')
    const defaultCopiedDescription = copiedDescriptionElement?.innerText.trim() || ''
    let resetId

    const copyNumber = (block) => {
        clearTimeout(resetId)
        
        
        const cardNumberElement = document.getElementById('card-number')
        const contentNumberElement = block.getElementsByClassName('number-content')?.[0]
        if (!cardNumberElement && !contentNumberElement) {
            return
        }

        let contentNumber
        if (cardNumberElement) {
            block.classList.add('copied')
            contentNumber = cardNumberElement.innerText.replaceAll(/\s/g, "")
        } else {
            const wrapper = document.getElementsByClassName('content-number-wrapper')?.[0]
            if (copiedDescriptionElement) {
                const copiedText = contentNumberElement.dataset?.copied
                const copiedDescription = copiedText?.length > 0 ? copiedText : defaultCopiedDescription
                copiedDescriptionElement.innerText = copiedDescription
            }

            if (wrapper) {
                wrapper.classList.add('copied')
            }
            
            contentNumber = contentNumberElement.innerText.replaceAll(/\s/g, "")
        }
        
        navigator.clipboard.writeText(contentNumber)
        navigator.vibrate(COPY_VIBRATION_TIME)

        resetId = setTimeout(() => {
            resetCopy(block)
        }, RESET_TIMEOUT)
    }

    const resetCopy = (block) => {
        document.querySelectorAll('.copied').forEach(element => {
            element.classList.remove('copied')
        })
    }

    const initCopy = () => {
        const blocks = document.querySelectorAll('[id$=block]')
        if (!blocks) {
            return
        }

        blocks.forEach(block => {
            block.onclick = () => {
                copyNumber(block)
            }
        })

        
    }

    initCopy()
})()
