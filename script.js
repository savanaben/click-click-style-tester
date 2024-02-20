

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






function updateTargetsTabindex(tabindexValue, draggableElement = null) {
    let targets;
    if (draggableElement) {
        // If draggableElement is provided, update tabindex only for targets in the same set
        const dragDropSet = draggableElement.closest('.drag-drop-set');
        targets = dragDropSet.querySelectorAll('.target');
    } else {
        // If no draggableElement is provided, select all targets
        targets = document.querySelectorAll('.target');
    }
    targets.forEach(target => {
        target.tabIndex = tabindexValue;
    });
}

// Call updateTargetsTabindex with -1 initially to ensure targets are not tabbable by default
document.addEventListener('DOMContentLoaded', () => {
    updateTargetsTabindex(-1);
});


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

function handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    // Find the closest .drag-drop-set container to the currently focused element
    const currentSet = activeElement.closest('.drag-drop-set');
    if (!currentSet) return; // Exit if no parent container matches

    // Selecting elements within the current .drag-drop-set container
    const elements = Array.from(currentSet.querySelectorAll('.target, [data-component="Draggable"][data-selected="true"]'));
    const focusedIndex = elements.indexOf(activeElement);
    
    let nextIndex = focusedIndex; // Default to the current index if no navigation key is pressed
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Move focus to the previous item or wrap around to the last item
        nextIndex = focusedIndex - 1 < 0 ? elements.length - 1 : focusedIndex - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        // Move focus to the next item or wrap around to the first item
        nextIndex = (focusedIndex + 1) % elements.length;
    }

    // Safely attempt to focus the next element in the sequence
    if(elements[nextIndex]) {
        event.preventDefault(); // Prevent default arrow key behavior (scrolling)
        elements[nextIndex].focus();
    }
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

    for (let i = 0; i < 4; i++) {
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

        // Add the data-component attribute to make it draggable
        svgWrapper.setAttribute('data-component', 'Draggable');

        svgWrapper.draggable = true;
        svgWrapper.tabIndex = 0; // Make it focusable
        svgWrapper.addEventListener('focus', function() {
            this.classList.add('SVG-focus-state');
        });
        svgWrapper.addEventListener('blur', function() {
            this.classList.remove('SVG-focus-state');
        });
        svgWrapper.addEventListener('click', toggleDraggableSelection);
        svgWrapper.addEventListener('dragstart', dragStart);
        svgWrapper.addEventListener('dragend', dragEnd);
        dropZone.appendChild(svgWrapper);
    }
}





function toggleDraggableSelection(event) {
    const target = event.currentTarget; // Use currentTarget to ensure you're getting the element with the event listener
    const isSelected = target.dataset.selected === "true";
    resetSelectionAndHighlight();

    if (!isSelected) {
        // Check if the element is an SVG draggable
        if (target.classList.contains('SVG-default-style')) {
            target.classList.add('SVG-default-style-selected');
        } else {
            target.classList.add('css-grb9ji-selected');
        }
        target.dataset.selected = "true";
        highlightTargetsForDraggable(target);
        highlightOthersInDragLocation(target);
        target.focus();
        updateTargetsTabindex(0, target);
    } else {
        target.dataset.selected = "false";
        updateTargetsTabindex(-1);
    }
}



function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);

    // Calculate the offset between the cursor and the top-left corner of the draggable element
    var rect = event.target.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;

    // Create a transparent image to use as the drag image
    var transparentImage = new Image();
    transparentImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    event.dataTransfer.setDragImage(transparentImage, 0, 0);

    // Create a clone of the draggable element
    var dragImage = event.target.cloneNode(true);
    if (event.target.closest('.SVG-default-style')) {
        dragImage.id = "customSVGDragImage"; // Different ID for SVG draggables
        dragImage.classList.add('SVG-default-style-selected'); // Add the selected class for SVG
    } else {
        dragImage.id = "customDragImage";
        dragImage.classList.add('css-grb9ji-selected'); // Add the selected class for standard draggables
    }
    dragImage.style.position = "absolute";
    dragImage.style.zIndex = "10000"; // Ensure it appears on top
    dragImage.style.pointerEvents = "none"; // Prevent the custom drag image from capturing mouse events
    document.body.appendChild(dragImage);

    // Position the custom drag image relative to the cursor using the offset
    dragImage.style.top = (event.clientY + window.scrollY - offsetY) + "px";
    dragImage.style.left = (event.clientX + window.scrollX - offsetX) + "px";

    // Move the custom drag image with the cursor
    document.addEventListener('dragover', function(e) {
        dragImage.style.top = (e.clientY + window.scrollY - offsetY) + "px";
        dragImage.style.left = (e.clientX + window.scrollX - offsetX) + "px";
    });

    // Hide the original element during the drag
    setTimeout(() => event.target.style.visibility = "hidden", 0);

    // Reset any existing highlights
    resetSelectionAndHighlight();

    // Highlight targets and other dropped draggables
    highlightTargetsForDraggable(event.target);
    highlightOthersInDragLocation(event.target);
}











function highlightTargetsForDraggable(draggableElement) {
    const dragDropSet = draggableElement.closest('.drag-drop-set');
    if (dragDropSet) {
        // Highlight only targets within the same set
        const targets = dragDropSet.querySelectorAll('.target');
        targets.forEach(target => {
            target.classList.add('target-highlighted');
        });

        // Check if the draggable is within a "drag-location"
        if (draggableElement.closest('.drag-location')) {
            // If so, highlight the drop zone within the same drag-drop-set
            const dropZone = dragDropSet.querySelector('.css-8znkpr'); // Adjust the selector as needed
            if (dropZone) {
                dropZone.classList.add('target-highlighted');
            }
        }
    }
}


function highlightOthersInDragLocation(selectedDraggable) {
    // Step 1: Find the closest `.drag-drop-set` ancestor.
    const dragDropSet = selectedDraggable.closest('.drag-drop-set');
    if (!dragDropSet) return; // If there's no `.drag-drop-set` parent, exit the function.

    // Step 2: Query all `.drag-location` divs within this ancestor.
    const dragLocations = dragDropSet.querySelectorAll('.drag-location');

    // Step 3: Iterate through each `.drag-location` to find and highlight all other draggables.
    dragLocations.forEach(dragLocation => {
        const otherDraggables = dragLocation.querySelectorAll('[data-component="Draggable"]');
        otherDraggables.forEach(draggable => {
            if (draggable !== selectedDraggable) { // Exclude the current draggable
                draggable.classList.add('draggable-highlighted');
            }
        });
    });
}







function dragEnd(event) {
    event.target.style.visibility = "visible";

    // Remove the custom drag image for standard draggables
    var customDragImage = document.getElementById("customDragImage");
    if (customDragImage) {
        document.body.removeChild(customDragImage);
    }

    // Remove the custom drag image for SVG draggables
    var customSVGDragImage = document.getElementById("customSVGDragImage");
    if (customSVGDragImage) {
        document.body.removeChild(customSVGDragImage);
    }

    // Reset the highlighted state only after dragging ends
    resetSelectionAndHighlight();
}




document.addEventListener('DOMContentLoaded', (event) => {
    const dropZones = document.querySelectorAll('[data-component="DropZone"]');

    dropZones.forEach(dropZone => {
        // Add 'dragover' event to ensure 'preventDefault' is called to allow drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow the drop
            // Optionally, you can add conditions here similar to 'dragenter' if needed
        });

        dropZone.addEventListener('dragenter', (e) => {
            // Check if the dropZone has the 'target-highlighted' class
            if(dropZone.classList.contains('target-highlighted')) {
                // Only add 'target-dragged-over' if 'target-highlighted' is present
                dropZone.classList.add('target-dragged-over');
            }
        });

        dropZone.addEventListener('dragleave', (e) => {
            // Always remove 'target-dragged-over' on drag leave, as it's no longer being dragged over
            dropZone.classList.remove('target-dragged-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); // Prevent default to handle the drop with JavaScript
            console.log('Item dropped');
            // Remove visual feedback regardless of condition
            dropZone.classList.remove('target-dragged-over');
            // Here you might want to handle the drop based on additional conditions
        });
    });
});



function dragOver(event) {
    event.preventDefault();
    // Attempt to find the closest DropZone or highlighted target from the event target
    let target = event.target.closest('.target-highlighted, .css-8znkpr');
    if (!target) { // If no such element is found, try to use currentTarget as a fallback
        target = event.currentTarget.closest('.target-highlighted, .css-8znkpr');
    }
    if (target && target.classList.contains('target-highlighted')) {
        target.classList.add('target-dragged-over');
    }
}


function dragLeave(event) {
    // Similar direct check as in dragOver
    const target = event.target.closest('.target-highlighted, .css-8znkpr.target-highlighted');
    if (target) {
        target.classList.remove('target-dragged-over');
    }
}

function drop(event) {
    event.preventDefault();
    // Apply the same checking logic for the drop event
    const target = event.target.closest('.target-highlighted, .css-8znkpr.target-highlighted');
    if (target) {
        target.classList.remove('target-dragged-over');
        // Here, you might want to execute additional logic for handling the drop action
    }
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

    // Remove highlight from specific dropzone-2
    const specificDropZone = document.getElementById('source-tray-2');
    if (specificDropZone) {
        specificDropZone.classList.remove('target-highlighted');
    }

    // Addition: Resetting/removing draggable-highlighted class from elements
    document.querySelectorAll('.draggable-highlighted').forEach(el => {
        el.classList.remove('draggable-highlighted');
    });

    updateTargetsTabindex(-1); // Reset tabindex of targets
}






document.addEventListener('click', function(event) {
    let isDraggable = event.target.closest('[data-component="Draggable"]');
    if (!isDraggable) {
        resetSelectionAndHighlight();
    }
});






