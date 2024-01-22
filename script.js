document.addEventListener('DOMContentLoaded', function() {
    setupSVGDropZone('svg-drop-zone-1x', false);
    setupSVGDropZone('svg-drop-zone-2x', true);

    document.querySelectorAll('[data-component="Draggable"]').forEach(item => {
        item.addEventListener('click', toggleDraggableSelection);
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });

    document.querySelectorAll('.target').forEach(target => {
        target.addEventListener('dragover', dragOver);
        target.addEventListener('dragleave', dragLeave);
        target.addEventListener('drop', drop);
        target.addEventListener('focus', targetFocus); // Add focus event listener
        target.addEventListener('blur', targetBlur); // Add blur event listener
    });


    // Global focusin event listener
    document.addEventListener('focusin', function(event) {
        if (!event.target.closest('[data-component="Draggable"], .target')) {
            resetSelectionAndHighlight();
        }
    });



    setupKeyboardNavigation();


});


function targetFocus(event) {
    event.target.classList.add('target-dragged-over');
}

function targetBlur(event) {
    event.target.classList.remove('target-dragged-over');
}



function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            let selectedDraggable = document.querySelector('[data-component="Draggable"][data-selected="true"]');
            if (selectedDraggable) {
                handleArrowNavigation(event, selectedDraggable);
            }
        }
    });
}

function handleArrowNavigation(event, selectedDraggable) {
    event.preventDefault();
    const elements = [selectedDraggable, ...document.querySelectorAll('.target')];
    const focusedElement = document.activeElement;
    const focusedIndex = elements.indexOf(focusedElement);
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const nextIndex = (focusedIndex + direction + elements.length) % elements.length;
    elements[nextIndex].focus();
}








function setupSVGDropZone(dropZoneId, scaleUp) {
    const svgDropZone = document.getElementById(dropZoneId);
    svgDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    svgDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        if (e.dataTransfer.items) {
            if (e.dataTransfer.items[0].kind === 'file') {
                var file = e.dataTransfer.items[0].getAsFile();
                readSVGFile(file, scaleUp);
            }
        }
    });
}

function readSVGFile(file, scaleUp) {
    var reader = new FileReader();
    reader.onload = function(e) {
        replaceDraggablesWithSVG(e.target.result, scaleUp);
    };
    reader.readAsText(file);
}

function replaceDraggablesWithSVG(svgContent, scaleUp) {
    const dropZone = document.querySelector('.css-8znkpr');
    dropZone.innerHTML = ''; // Clear existing content

    for (let i = 0; i < 3; i++) {
        const svgWrapper = document.createElement('div');
        svgWrapper.classList.add('SVG-default-style');
        svgWrapper.innerHTML = svgContent;

        const svgElement = svgWrapper.querySelector('svg');
        if (svgElement) {
            // Determine original dimensions
            let originalWidth = parseInt(svgElement.getAttribute('width') || 100, 10);
            let originalHeight = parseInt(svgElement.getAttribute('height') || 100, 10);

            // Scale dimensions if scaleUp is true
            if (scaleUp) {
                svgElement.setAttribute('width', originalWidth * 2);
                svgElement.setAttribute('height', originalHeight * 2);
            }

            // Set viewBox if it's not already set
            if (!svgElement.hasAttribute('viewBox')) {
                svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
            }
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







function toggleDraggableSelection(event) {
    const isSelected = event.target.classList.contains('css-grb9ji-selected');
    resetSelectionAndHighlight();

    if (!isSelected) {
        event.target.classList.add('css-grb9ji-selected');
        event.target.dataset.selected = "true";
        highlightAllTargets();
        event.target.focus(); // Add focus to the selected draggable
        updateTargetsTabindex(0); // Make targets tabbable
    } else {
        updateTargetsTabindex(-1); // Make targets not tabbable
    }
}


function updateTargetsTabindex(tabindexValue) {
    document.querySelectorAll('.target').forEach(target => {
        target.tabIndex = tabindexValue;
    });
}

// Call updateTargetsTabindex with -1 initially to ensure targets are not tabbable by default
document.addEventListener('DOMContentLoaded', () => {
    updateTargetsTabindex(-1);
});




function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    setTimeout(() => event.target.style.visibility = "hidden", 0);

    // Remove the selected state from all draggables
    resetSelectionAndHighlight();

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




function highlightAllTargets() {
    document.querySelectorAll('.target').forEach(target => {
        target.classList.add('target-highlighted');
    });
}




function resetSelectionAndHighlight() {
    document.querySelectorAll('[data-component="Draggable"][data-selected="true"]').forEach(draggable => {
        draggable.dataset.selected = "false"; // Update data-selected attribute
    });

    document.querySelectorAll('.css-grb9ji-selected, .SVG-default-style-selected').forEach(el => {
        el.classList.remove('css-grb9ji-selected', 'SVG-default-style-selected');
    });

    document.querySelectorAll('.target').forEach(target => {
        target.classList.remove('target-highlighted', 'target-dragged-over');
    });

    updateTargetsTabindex(-1); // Reset tabindex of targets
}





document.addEventListener('click', function(event) {
    let isDraggable = event.target.closest('[data-component="Draggable"]');
    if (!isDraggable) {
        resetSelectionAndHighlight();
    }
});






