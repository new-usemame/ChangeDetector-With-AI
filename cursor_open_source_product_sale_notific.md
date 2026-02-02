# Open source product sale notifications
_Exported on 2/2/2026 at 00:44:38 EST from Cursor (2.3.35)_

---

**User**

are there any open source tools that allow me to basically watch a product on a website and have it notify me when it goes on sale? i want it to work on a bunch of websites .. is there anything that exists for this?

---

**Cursor**


Searching for open-source tools that monitor product prices across multiple websites and send notifications.



Here are open-source tools that monitor products across multiple websites and notify on price drops:

## Top open-source options

### 1. **changedetection.io** (most popular)
- ~30k GitHub stars
- Self-hosted website change detection
- Supports price drop alerts and restock notifications
- Works across many websites
- Free and open source (also offers SaaS)
- GitHub: `dgtlmoon/changedetection.io`

### 2. **Discount Bandit**
- Open source price tracker
- Tracks products across multiple stores
- Alerts when prices meet your criteria
- Free, no data collection
- Default: crawls 60 products per store every 5 minutes
- Website: `discount-bandit.cybrarist.com`

### 3. **pricewatch**
- Lightweight open-source project
- Monitors item prices on websites
- Notifies on price changes
- GitHub: `builder555/pricewatch`

## Browser extensions (not open source, but convenient)

- **HARPA AI**: Chrome extension for Amazon, AliExpress, etc.
- **Purchr**: Chrome extension for 200+ websites

## Recommendation

For a self-hosted, open-source solution, start with **changedetection.io** — it’s the most mature and feature-rich.

Should I help you set up one of these, or build a custom solution for your needs?

---

**User**

for changedetection what are some common complaints that hinder usability? like what if a site changes the product id or something when they update the product? is that common? are there some holes that an AI agent could help? Do research

---

**Cursor**


Researching common complaints and usability issues with changedetection.io, focusing on product ID changes and other pain points.



Searching for specific GitHub issues and community discussions:



Searching for general web scraping and price tracking challenges:



## Common complaints and usability issues

### 1. Selector brittleness (product ID changes)
- Problem: Relies on CSS/XPath selectors to find price elements. When sites change HTML structure, IDs, or class names, selectors break.
- Frequency: Common. E-commerce sites update layouts regularly (redesigns, A/B tests, framework migrations).
- Impact: Monitors stop working silently or produce false positives.

### 2. False positives/negatives
- Problem: Triggers on irrelevant changes (ads, recommendations, timestamps) or misses real price changes.
- Cause: Overly broad selectors or dynamic content interfering.

### 3. JavaScript-heavy sites
- Problem: Limited support for SPAs and dynamically loaded content.
- Impact: Requires browser automation (Chrome), adding complexity and cost.

### 4. Bot detection and blocking
- Problem: Sites block or throttle frequent crawlers.
- Impact: Monitors fail or get rate-limited.

### 5. Manual configuration overhead
- Problem: Each site needs custom selectors and rules.
- Impact: High setup and maintenance effort.

### 6. Product URL changes
- Problem: When product URLs change (e.g., new SKU/ID), tracking is lost.
- Impact: Requires manual reconfiguration.

## Where AI agents could help

### 1. Semantic product matching
- Use vision/NLP to identify products by name, image, or specs instead of fixed IDs/selectors.
- Handle product page redesigns and URL changes.

### 2. Automatic selector repair
- Detect when selectors break and generate new ones.
- Use multiple fallback strategies (visual, semantic, structural).

### 3. Layout-agnostic extraction
- Extract prices/availability regardless of HTML structure.
- Use LLMs to understand page semantics.

### 4. Intelligent change detection
- Distinguish meaningful changes (price drops) from noise (ads, timestamps).
- Reduce false positives.

### 5. Cross-site product reconciliation
- Track the same product across retailers despite different structures.
- Match by product attributes rather than page structure.

### 6. Adaptive learning
- Learn site-specific patterns and adapt to gradual changes.
- Improve accuracy over time.

## Research gaps

I couldn’t find specific GitHub issues documenting these complaints, which suggests:
- Users may work around issues silently
- Problems are accepted as limitations
- There’s an opportunity for an AI-enhanced solution

## Bottom line

Product ID and structure changes are common and break selector-based tools. An AI agent layer could make price tracking more robust by:
- Using semantic understanding instead of brittle selectors
- Automatically adapting to site changes
- Reducing false positives through intelligent filtering
- Handling dynamic content more effectively

Should I help design or prototype an AI-enhanced price tracking solution that addresses these gaps?

---

**User**

can we essentially use changedetection with an AI agent to do this? what would that look like? would it be better to use their framework, fork it or create using it, or create our own entire implementation?

---

**Cursor**


Researching changedetection.io's architecture and extensibility to design an AI-enhanced solution.



Checking the current project structure:



Here are the architecture options and a recommendation:

## Architecture options

### Option 1: AI wrapper/middleware layer (recommended)

Build an AI agent that works alongside changedetection.io without modifying it.

```
┌─────────────────────────────────────────┐
│   AI Agent Service (Your Layer)        │
│  - Semantic price extraction           │
│  - Selector auto-repair                 │
│  - False positive filtering            │
│  - Product matching across redesigns   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   changedetection.io (Unmodified)       │
│  - Page fetching                        │
│  - Scheduling                           │
│  - Notifications (85+ formats)          │
│  - Browser automation                   │
│  - Storage                              │
└─────────────────────────────────────────┘
```

How it works:
1. changedetection.io fetches pages (handles JS rendering, auth, etc.)
2. AI agent intercepts HTML before selector extraction
3. AI extracts price/product info semantically
4. AI validates and repairs broken selectors
5. Results feed back into changedetection.io's notification system

Pros:
- Fastest to implement
- No maintenance burden from forking
- Leverages changedetection.io's infrastructure
- Can be deployed as a separate service
- Easy to test and iterate

Cons:
- Limited to changedetection.io's API/extensibility
- May need to work around some limitations

---

### Option 2: Fork and integrate

Fork changedetection.io and add AI directly into the core.

```
┌─────────────────────────────────────────┐
│   Forked changedetection.io             │
│  ┌───────────────────────────────────┐  │
│  │ AI Extractor Module (New)         │  │
│  │ - Vision/LLM price detection      │  │
│  │ - Semantic understanding          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Traditional Selectors (Fallback) │  │
│  └───────────────────────────────────┘  │
│  - All existing features                 │
└─────────────────────────────────────────┘
```

Pros:
- Full control over the pipeline
- Can optimize AI integration deeply
- Can contribute improvements upstream

Cons:
- Must maintain your fork
- Harder to merge upstream updates
- More development time

---

### Option 3: Build from scratch

Create a new implementation using AI-first architecture.

```
┌─────────────────────────────────────────┐
│   Custom AI Price Tracker               │
│  - AI-powered extraction (primary)       │
│  - Playwright/Selenium for fetching    │
│  - Custom notification system           │
│  - Custom scheduling                    │
│  - Custom storage                        │
└─────────────────────────────────────────┘
```

Pros:
- Complete control
- AI-native design
- No legacy constraints

Cons:
- Most development effort
- Reinvent infrastructure (notifications, scheduling, etc.)
- Lose community support and battle-tested features

---

## Recommendation: Option 1 (AI wrapper layer)

Reasons:
1. Changedetection.io handles the hard parts: browser automation, scheduling, notifications, storage
2. You focus on the AI layer: semantic extraction, selector repair, false positive filtering
3. Faster to market: weeks vs months
4. Lower maintenance: benefit from upstream updates
5. Flexible: can evolve to a fork later if needed

## Implementation architecture

Here's what the AI wrapper would look like:

```python
# AI Agent Service Architecture
┌─────────────────────────────────────────────┐
│  AI Price Extraction Agent                  │
├─────────────────────────────────────────────┤
│  1. HTML Pre-processor                      │
│     - Clean HTML                            │
│     - Extract structured data (JSON-LD)      │
│     - Screenshot capture (for vision)       │
│                                             │
│  2. Semantic Price Extractor                │
│     - LLM: "Find the main product price"    │
│     - Vision: OCR price from screenshot     │
│     - Fallback: Multiple selector attempts │
│                                             │
│  3. Product Matcher                         │
│     - Compare product name/image            │
│     - Handle URL/ID changes                  │
│     - Cross-site reconciliation             │
│                                             │
│  4. Change Validator                        │
│     - Filter false positives                │
│     - Validate price changes are real       │
│     - Detect layout changes vs price drops  │
│                                             │
│  5. Selector Repair Engine                 │
│     - Detect broken selectors               │
│     - Generate new selectors via AI         │
│     - Update changedetection config         │
└─────────────────────────────────────────────┘
```

Integration points with changedetection.io:
1. Webhook/API: Monitor when selectors fail, intercept before notifications
2. Custom fetcher: Create a custom fetcher that uses AI extraction
3. Filter system: Use AI as a filter to validate changes
4. External service: Run as a separate service that changedetection.io calls

## Next steps

I can:
1. Create a proof-of-concept AI wrapper service
2. Design the integration architecture in detail
3. Build a minimal implementation to test the concept

Which approach do you prefer? Should I start with a prototype of the AI wrapper layer?

```plaintext
┌─────────────────────────────────────────┐
│   AI Agent Service (Your Layer)        │
│  - Semantic price extraction           │
│  - Selector auto-repair                 │
│  - False positive filtering            │
│  - Product matching across redesigns   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   changedetection.io (Unmodified)       │
│  - Page fetching                        │
│  - Scheduling                           │
│  - Notifications (85+ formats)          │
│  - Browser automation                   │
│  - Storage                              │
└─────────────────────────────────────────┘
```

```plaintext
┌─────────────────────────────────────────┐
│   Forked changedetection.io             │
│  ┌───────────────────────────────────┐  │
│  │ AI Extractor Module (New)         │  │
│  │ - Vision/LLM price detection      │  │
│  │ - Semantic understanding          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Traditional Selectors (Fallback) │  │
│  └───────────────────────────────────┘  │
│  - All existing features                 │
└─────────────────────────────────────────┘
```

```plaintext
┌─────────────────────────────────────────┐
│   Custom AI Price Tracker               │
│  - AI-powered extraction (primary)       │
│  - Playwright/Selenium for fetching    │
│  - Custom notification system           │
│  - Custom scheduling                    │
│  - Custom storage                        │
└─────────────────────────────────────────┘
```

```python
# AI Agent Service Architecture
┌─────────────────────────────────────────────┐
│  AI Price Extraction Agent                  │
├─────────────────────────────────────────────┤
│  1. HTML Pre-processor                      │
│     - Clean HTML                            │
│     - Extract structured data (JSON-LD)      │
│     - Screenshot capture (for vision)       │
│                                             │
│  2. Semantic Price Extractor                │
│     - LLM: "Find the main product price"    │
│     - Vision: OCR price from screenshot     │
│     - Fallback: Multiple selector attempts │
│                                             │
│  3. Product Matcher                         │
│     - Compare product name/image            │
│     - Handle URL/ID changes                  │
│     - Cross-site reconciliation             │
│                                             │
│  4. Change Validator                        │
│     - Filter false positives                │
│     - Validate price changes are real       │
│     - Detect layout changes vs price drops  │
│                                             │
│  5. Selector Repair Engine                 │
│     - Detect broken selectors               │
│     - Generate new selectors via AI         │
│     - Update changedetection config         │
└─────────────────────────────────────────────┘
```

