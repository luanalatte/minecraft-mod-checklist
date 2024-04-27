function get_hostname(url) {
    return new URL(url).hostname.toLowerCase().split('.').slice(-2, -1);
}

function get_value_from_checkbox(mode, cb) {
    let slug = cb.dataset.slug;
    let url = cb.dataset.url;

    if (mode == 0) {
        return cb.dataset.name || slug;
    } else if (mode == 1) {
        return slug;
    } else {
        if (url) {
            var hostname = get_hostname(url);
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
                            let hostname = get_hostname(url);
                            if (hostname == 'modrinth') {
                                link.innerHTML = '<svg role="img" class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.252.004a11.78 11.768 0 0 0-8.92 3.73 11 10.999 0 0 0-2.17 3.11 11.37 11.359 0 0 0-1.16 5.169c0 1.42.17 2.5.6 3.77.24.759.77 1.899 1.17 2.529a12.3 12.298 0 0 0 8.85 5.639c.44.05 2.54.07 2.76.02.2-.04.22.1-.26-1.7l-.36-1.37-1.01-.06a8.5 8.489 0 0 1-5.18-1.8 5.34 5.34 0 0 1-1.3-1.26c0-.05.34-.28.74-.5a37.572 37.545 0 0 1 2.88-1.629c.03 0 .5.45 1.06.98l1 .97 2.07-.43 2.06-.43 1.47-1.47c.8-.8 1.48-1.5 1.48-1.52 0-.09-.42-1.63-.46-1.7-.04-.06-.2-.03-1.02.18-.53.13-1.2.3-1.45.4l-.48.15-.53.53-.53.53-.93.1-.93.07-.52-.5a2.7 2.7 0 0 1-.96-1.7l-.13-.6.43-.57c.68-.9.68-.9 1.46-1.1.4-.1.65-.2.83-.33.13-.099.65-.579 1.14-1.069l.9-.9-.7-.7-.7-.7-1.95.54c-1.07.3-1.96.53-1.97.53-.03 0-2.23 2.48-2.63 2.97l-.29.35.28 1.03c.16.56.3 1.16.31 1.34l.03.3-.34.23c-.37.23-2.22 1.3-2.84 1.63-.36.2-.37.2-.44.1-.08-.1-.23-.6-.32-1.03-.18-.86-.17-2.75.02-3.73a8.84 8.839 0 0 1 7.9-6.93c.43-.03.77-.08.78-.1.06-.17.5-2.999.47-3.039-.01-.02-.1-.02-.2-.03Zm3.68.67c-.2 0-.3.1-.37.38-.06.23-.46 2.42-.46 2.52 0 .04.1.11.22.16a8.51 8.499 0 0 1 2.99 2 8.38 8.379 0 0 1 2.16 3.449 6.9 6.9 0 0 1 .4 2.8c0 1.07 0 1.27-.1 1.73a9.37 9.369 0 0 1-1.76 3.769c-.32.4-.98 1.06-1.37 1.38-.38.32-1.54 1.1-1.7 1.14-.1.03-.1.06-.07.26.03.18.64 2.56.7 2.78l.06.06a12.07 12.058 0 0 0 7.27-9.4c.13-.77.13-2.58 0-3.4a11.96 11.948 0 0 0-5.73-8.578c-.7-.42-2.05-1.06-2.25-1.06Z"/></svg>';
                            } else if (hostname == 'curseforge') {
                                link.innerHTML = '<svg role="img" class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z"/></svg>';
                            } else {
                                link.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square fa-sm fa-fw"></i>';
                            }

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

                    // Firefox doesn't support details[name] as of yet, so we're adding this dirty fix until that happens.
                    if (navigator.userAgent.toLowerCase().includes('firefox')) {
                        details.addEventListener('toggle', () => {
                            if (details.open) {
                                document.querySelectorAll('details').forEach(d2 => {
                                    if (d2 != details && d2.name == details.name) {
                                        d2.open = false;
                                    }
                                });
                            }
                        });
                    }

                    modlist.insertBefore(details, footer);
                });

                document.querySelector('#modlist details:first-of-type').toggleAttribute('open');

                setup_checkboxes();
                generate();
            })
            .catch(error => {
                console.error('Error:', error);
            }
        );

    });

})();