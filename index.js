function get_value_from_checkbox(mode, cb) {
    let slug = cb.dataset.slug;
    let url = cb.dataset.url;

    if (mode == 0) {
        return cb.dataset.name || slug;
    } else if (mode == 1) {
        return slug;
    } else {
        if (url) {
            var hostname = new URL(url).hostname.toLowerCase().split('.').slice(-2, -1);
        }

        if (mode == 2) {
            if (url)
                return url

            if (hostname == 'modrinth') {
                return 'https://modrinth.com/' + slug
            } else if (hostname == 'curseforge') {
                return 'https://www.curseforge.com/minecraft/mc-mods/' + slug;
            }

        } else if (hostname) {
            return "packwiz " + hostname + " add " + slug;
        }

        return slug;
    }
}

function setup_checkboxes() {
    let checkboxes = document.querySelectorAll('#modlist input[type="checkbox"]');
    checkboxes.forEach(cb => {
        let children = [];
        if (cb.dataset.slug) {
            children = document.querySelectorAll('#modlist input[type="checkbox"][data-parent="' + cb.dataset.slug + '"]');
            children.forEach(child => {
                child.addEventListener('change', () => {
                    if (child.checked) {
                        cb.checked = true;
                    }
                });
            });
        };

        cb.addEventListener('change', () => {
            if (!this.checked) {
                children.forEach(child => {
                    child.checked = false;
                });
            }
            generate();
        });
    });
}

async function copy_to_clipboard(el, id) {
    let textarea = document.getElementById(id);
    try {
        navigator.aclipboard.writeText(textarea.value);
    } catch {
        textarea.select();
        document.execCommand("copy");
        textarea.blur();
    }

    el.dataset.tooltip = 'Copied!';
    await new Promise(r => setTimeout(r, 1000));
    el.blur();
    el.dataset.tooltip = 'Copy to clipboard';
}

function clear_selection() {
    let checkboxes = document.querySelectorAll('#modlist input[type="checkbox"]')
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    let textarea = document.getElementById('txtOutput');
    textarea.value = '';
}

function generate() {
    let select = document.getElementById('lstOutputType');

    let textarea = document.getElementById('txtOutput');
    textarea.value = '';

    let checkboxes = document.querySelectorAll('#modlist input[type="checkbox"]:checked');
    let lines = [];
    checkboxes.forEach(cb => {
        lines.push(get_value_from_checkbox(select.value, cb));
    });

    textarea.value = lines.join("\n");
}

(() => {

    document.addEventListener('DOMContentLoaded', () => {
        let copy_links = document.querySelectorAll('a.copy-to-clipboard');
        copy_links.forEach(a => {
            a.innerHTML += '<i class="fa-regular fa-copy fa-fw"></i>';
        });

        let modlist = document.getElementById('modlist');
        let footer = modlist.querySelector('#modlist > footer');
        fetch('mods.json')
            .then(response => response.json())
            .then(data => {
                Object.entries(data).forEach(([category, mods]) => {
                    let details = document.createElement('details');
                    details.setAttribute('name', 'modlist');

                    let summary = document.createElement('summary');
                    summary.setAttribute('role', 'button');
                    summary.setAttribute('class', 'secondary outline');
                    summary.innerText = category;
                    details.appendChild(summary);

                    let fieldset = document.createElement('fieldset');
                    mods.forEach(mod => {
                        let name = mod['name'];
                        let slug = mod['slug'];
                        let url = mod['url'];
                        let parent = mod['parent'];
                        let desc = mod['desc'];
                        let checked = mod['checked'] || false;
                        let loader = mod['loader'];

                        if (url && !slug) {
                            slug = url.split('/').pop().split('?')[0];
                        }

                        let label = document.createElement('label');

                        let checkbox = document.createElement('input');
                        checkbox.setAttribute('type', 'checkbox');

                        checkbox.dataset.slug = slug;
                        if (name)
                            checkbox.dataset.name = name;
                        if (url)
                            checkbox.dataset.url = url
                        if (parent)
                            checkbox.dataset.parent = parent;

                        if (checked)
                            checkbox.checked = true;

                        label.appendChild(checkbox);


                        let modname = document.createElement('span');
                        modname.appendChild(document.createTextNode(name));
                        label.appendChild(modname);

                        if (url) {
                            let link = document.createElement('a');
                            link.href = url;
                            link.target = '_blank';
                            link.rel = 'external';
                            link.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square fa-sm fa-fw"></i>';

                            label.appendChild(link)
                        }

                        
                        let div = document.createElement('div');
                        div.className = 'mod';
                        div.appendChild(label);
                        
                        if (loader == 'fabric') {
                            let loader = document.createElement('mark');
                            loader.appendChild(document.createTextNode('Fabric'));
                            div.appendChild(loader);
                        }

                        if (desc) {
                            let small = document.createElement('small');
                            small.className = 'desc';
                            small.innerText = desc;
                            div.appendChild(small);
                        }

                        fieldset.appendChild(div);
                    });
                    details.appendChild(fieldset);
                    
                    modlist.insertBefore(details, footer);
                });

                document.querySelector('#modlist details:first-of-type').toggleAttribute('open');

                setup_checkboxes();
                generate();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

})();