export const styles = {
    'log': {
        name: 'log',
        prefix: '👀',
        color: '#073B4C',
        timeout: 5000
    },
    'warn': {
        name: 'warnings',
        prefix: '🚨',
        color: '#ffd166',
        style: 'color: black; background-color: #ffd166;padding: 4px; border-radius:4px;',
        timeout: 5000
    },
    'err': {
        name: 'errors',
        prefix: '👎',
        color: '#ef476f',
        style: 'color: white; background-color: #ef476f;padding: 4px; border-radius:4px;',
        timeout: 5000
    },
    'info': {
        name: 'infos',
        prefix: '☝️️',
        color: '#118ab2',
        style: 'color: white; background-color: #118ab2;padding: 4px; border-radius:4px;',
        timeout: 5000
    },
    'success': {
        name: 'success',
        prefix: '👍️',
        color: '#06d6a0',
        style: 'color: white; background-color: #06d6a0;padding: 4px; border-radius:4px;',
        timeout: 5000
    }
}
export const favicons = {
    'blue': require('./assets/images/fav-blue.png'),
    'orange': require('./assets/images/fav-orange.png'),
    'green': require('./assets/images/fav-green.png'),
    'pink': require('./assets/images/fav-pink.png'),
    'purple': require('./assets/images/fav-purple.png'),
    'yellow': require('./assets/images/fav-yellow.png'),
}
