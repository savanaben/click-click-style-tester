document.addEventListener('DOMContentLoaded', function() {
    const svgDropZone = document.getElementById('svg-drop-zone');
    svgDropZone.addEventListener('dragover', function(e) {
        e.preventDefault(); // Prevent default behavior (prevent file from being opened)
    });

    svgDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            if (e.dataTransfer.items[0].kind === 'file') {
                var file = e.dataTransfer.items[0].getAsFile();
                readSVGFile(file);
            }
        }
    });

    document.querySelectorAll('[data-component="Draggable"]').forEach(item => {
        item.addEventListener('click', toggleDraggableSelection);
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });

    document.querySelectorAll('.target').forEach(target => {
        target.addEventListener('dragover', dragOver);
        target.addEventListener('dragleave', dragLeave);
        target.addEventListener('drop', drop);
    });
});

function toggleDraggableSelection(event) {
    const isSelected = event.target.classList.contains('css-grb9ji-selected');
    resetSelectionAndHighlight();

    if (!isSelected) {
        event.target.classList.add('css-grb9ji-selected');
        event.target.dataset.selected = "true";
        highlightAllTargets();
    }
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    setTimeout(() => event.target.style.visibility = "hidden", 0);
    // Keep the targets highlighted during dragging
    highlightAllTargets();
}

function dragEnd(event) {
    event.target.style.visibility = "visible";
    // Reset the highlighted state only after dragging ends
    resetSelectionAndHighlight();
}

function dragOver(event) {
    event.preventDefault();
    const target = event.target.closest('.target');
    if (target) {
        target.classList.add('target-dragged-over');
    }
}

function dragLeave(event) {
    const target = event.target.closest('.target');
    if (target) {
        target.classList.remove('target-dragged-over');
    }
}

function drop(event) {
    event.preventDefault();
    const target = event.target.closest('.target');
    if (target) {
        target.classList.remove('target-dragged-over');
    }
}

function readSVGFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        replaceDraggablesWithSVG(e.target.result);
    };
    reader.readAsText(file);
}



function toggleSVGSelection(event) {
    event.stopPropagation();
    const parentDiv = event.currentTarget;

    const isSelected = parentDiv.classList.contains('SVG-default-style-selected');
    resetSelectionAndHighlight();

    if (!isSelected) {
        parentDiv.classList.add('SVG-default-style-selected');
        parentDiv.dataset.selected = "true";
        highlightAllTargets(); // Highlight all targets when SVG is selected
    } else {
        parentDiv.classList.remove('SVG-default-style-selected');
        parentDiv.dataset.selected = "false";
    }
}

function replaceDraggablesWithSVG(svgContent) {
    const dropZone = document.querySelector('.css-8znkpr');
    dropZone.innerHTML = ''; // Clear existing content

    for (let i = 0; i < 3; i++) {
        const svgWrapper = document.createElement('div');
        svgWrapper.classList.add('SVG-default-style');
        svgWrapper.innerHTML = svgContent;

        const svgElement = svgWrapper.querySelector('svg');
        if (svgElement) {
            // If viewBox is not set, create one based on width and height
            if (!svgElement.hasAttribute('viewBox') &&
                svgElement.hasAttribute('width') && 
                svgElement.hasAttribute('height')) {
                let originalWidth = parseInt(svgElement.getAttribute('width'), 10);
                let originalHeight = parseInt(svgElement.getAttribute('height'), 10);
                svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
            }

            // Scale the SVG by adjusting its width and height attributes
            let width = svgElement.getAttribute('width');
            let height = svgElement.getAttribute('height');
            svgElement.setAttribute('width', parseInt(width, 10) * 2);
            svgElement.setAttribute('height', parseInt(height, 10) * 2);
        }

        svgWrapper.draggable = true;
        svgWrapper.tabIndex = 0; // Make it focusable
        svgWrapper.addEventListener('focus', function() {
            this.classList.add('SVG-focus-state');
        });
        svgWrapper.addEventListener('blur', function() {
            this.classList.remove('SVG-focus-state');
        });
        svgWrapper.addEventListener('click', toggleSVGSelection);
        svgWrapper.addEventListener('dragstart', dragStart);
        svgWrapper.addEventListener('dragend', dragEnd);
        dropZone.appendChild(svgWrapper);
    }
}



function highlightAllTargets() {
    document.querySelectorAll('.target').forEach(target => {
        target.classList.add('target-highlighted');
    });
}

function resetSelectionAndHighlight() {
    document.querySelectorAll('.css-grb9ji, .SVG-default-style').forEach(el => {
        el.classList.remove('css-grb9ji-selected', 'SVG-default-style-selected');
        el.dataset.selected = "false";
    });
    document.querySelectorAll('.target').forEach(target => {
        target.classList.remove('target-highlighted', 'target-dragged-over');
    });
}

document.addEventListener('click', function(event) {
    let isDraggable = event.target.closest('[data-component="Draggable"]');
    if (!isDraggable) {
        resetSelectionAndHighlight();
    }
});
