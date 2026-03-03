# Mobile Optimization Plan

## Current State Assessment

The dashboard uses Tailwind CSS with responsive utilities, but there are opportunities to improve the mobile experience specifically for touch interfaces.

## Priority Improvements

### 1. Touch Target Sizes (High Priority)
**Problem:** Some interactive elements may be too small for comfortable touch interaction.

**Solution:**
- Ensure all clickable elements are at least 44x44px (Apple guidelines) or 48x48px (Material Design)
- Audit buttons, checkboxes, and links in:
  - TaskCard actions (complete, edit, delete, reorder)
  - ProjectCard interactions
  - Filter controls
  - Navigation elements

**Implementation:**
```tsx
// Add touch-friendly padding classes
<button className="min-h-[44px] min-w-[44px] p-3 ...">
  <Icon className="h-5 w-5" />
</button>
```

### 2. Mobile Navigation (High Priority)
**Problem:** Desktop-oriented navigation may not work well on small screens.

**Current:**
- Top header with search and theme toggle
- Sidebar/tabs for project detail pages

**Improvements:**
- Add hamburger menu for mobile (<768px)
- Bottom navigation bar for primary actions on mobile
- Sticky header that collapses on scroll
- Search as a modal/overlay on mobile

### 3. Card Layout Optimization (Medium Priority)
**Problem:** ProjectCard grid may be too dense on mobile.

**Solution:**
- Single column layout on mobile (already using `grid-cols-1`)
- Reduce padding and margins for better space usage
- Stack card elements vertically instead of horizontal flex
- Hide less critical stats on mobile (show on tap/expand)

**Mobile-specific card:**
```tsx
<div className="md:flex md:items-center">
  {/* Stack on mobile, flex on desktop */}
  <div className="flex-1 space-y-2 md:space-y-0">
    {/* Content */}
  </div>
</div>
```

### 4. Responsive Tables (Medium Priority)
**Problem:** Commit history table doesn't work well on narrow screens.

**Solution:**
- Card-based layout for commits on mobile
- Horizontal scroll for tables (last resort)
- Collapsible sections to show/hide details

### 5. Forms and Inputs (High Priority)
**Problem:** TaskForm and filters may be cramped on mobile.

**Solution:**
- Full-width inputs on mobile
- Larger touch targets for form controls
- Bottom sheet/modal for forms instead of inline
- Proper keyboard types (`inputMode="numeric"` for dates, etc.)

**Example:**
```tsx
<input
  type="date"
  className="w-full md:w-auto text-base md:text-sm"
  inputMode="numeric"
/>
```

### 6. Gesture Support (Low Priority, Future)
**Potential additions:**
- Swipe to complete tasks
- Pull to refresh
- Swipe navigation between tabs
- Long press for context menus

### 7. Performance on Mobile (Medium Priority)
**Considerations:**
- Lazy load images and heavy components
- Reduce bundle size where possible
- Use `loading="lazy"` for images
- Implement virtual scrolling for long lists

## Testing Checklist

Before marking mobile optimization as complete, test on:

- [ ] iPhone (Safari) - various sizes (SE, 13, 14 Pro Max)
- [ ] Android (Chrome) - various sizes (small, medium, large)
- [ ] Tablet (iPad) - portrait and landscape
- [ ] Chrome DevTools mobile emulation
- [ ] Real device testing (borrow or use BrowserStack)

## Specific Components to Audit

### ProjectCard
- Touch targets for pin/unpin
- Stat badges (stars, issues, forks)
- Overflow handling for long names

### TaskCard
- Complete checkbox size
- Action buttons (edit, delete, reorder)
- Due date display
- Notes expansion

### TaskForm
- Input field sizes
- Date picker usability
- Priority selector
- Submit/cancel buttons

### ChangelogTab
- Commit list scrolling
- Code snippets overflow
- Day grouping headers

### Header
- Search bar on mobile
- Theme toggle position
- Logo/title truncation

### TaskFilters
- Filter dropdowns on mobile
- Sort controls
- Clear filters button

## Implementation Strategy

1. **Audit Phase** (1-2 hours)
   - Use mobile DevTools to inspect each component
   - Document specific issues with screenshots
   - Prioritize fixes by impact

2. **Quick Wins** (2-3 hours)
   - Touch target sizes (simple padding adjustments)
   - Form input improvements
   - Card layout stacking

3. **Major Changes** (4-6 hours)
   - Mobile navigation refactor
   - Bottom sheet/modal patterns
   - Responsive table alternatives

4. **Testing & Polish** (2-3 hours)
   - Real device testing
   - Fix edge cases
   - Performance optimization

## Code Patterns to Use

### Responsive Utility Classes
```tsx
// Hide on mobile, show on desktop
<span className="hidden md:inline">Desktop only</span>

// Show on mobile, hide on desktop
<span className="md:hidden">Mobile only</span>

// Different sizes
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Touch-friendly spacing
<button className="p-2 md:p-1.5">
  Bigger on mobile
</button>
```

### Breakpoints Reference
- `sm:` — 640px and up
- `md:` — 768px and up
- `lg:` — 1024px and up
- `xl:` — 1280px and up
- `2xl:` — 1536px and up

### Custom Breakpoint Hooks
```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Success Criteria

Mobile optimization is complete when:
- ✅ All touch targets meet 44x44px minimum
- ✅ Forms are easy to fill on mobile
- ✅ No horizontal scroll on any page
- ✅ Navigation is intuitive on small screens
- ✅ Text is readable without zooming
- ✅ Images and content fit viewport
- ✅ Performance is acceptable on 3G
- ✅ Tested on real iOS and Android devices

## Resources

- [Apple Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs/touch-bar/)
- [Material Design - Accessibility](https://material.io/design/usability/accessibility.html)
- [Tailwind CSS - Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js - Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

**Next Steps:** Create a GitHub issue or project board task for each priority improvement. Tackle high-priority items first.
