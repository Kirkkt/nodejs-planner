What's the problem to solve here?
============

Given:

- everyday I have some time, and I have something to do (**items**).
- for each item, I can estimate how long its completion takes (in **days**).
- I have a **start date**, say today.
- I only work on one item at any given day, and I work on that item until its completion, before I
  work on the next item.

I want to:

- have an overview of the individual deadline for each item
- be able to add, remove items, as well as reorder the list

I haven't found a solution after some googling, so I decided to make my own.

Inspiration
===========

I'm a heavy vim user, and I borrowed some ideas from vim. Most importantly, the "mode" concept.

When entering into the program, you are in **normal mode**. In normal mode, you can move around, and
you can switch to other modes, like insert mode or visual mode; you can execute commands like write
command. See the next section for more information.

Quick start
=============

1. install node, if you haven't yet
2. if you want to start with same sample data: `cp items.json.sample items.json`
    - or if you prefer to start anew: `echo '[]' > items.json`
3. `node index.js`

Note that `items.json` stores the data, and you have to manually "write" to it, see below.

I add `items.json` into the `.gitignore` because it's subject to frequent change.

How-to's
========
### Normal mode

| command    |      effect      |
|----------|--------------|
| `j` | move cursor down |
| `k` | move cursor up |
| `v` | select the current item (defined by where the cursor is), and enter **visual mode**   |
| `a` | enter **insert mode** |
| `D` | delete the current item |
| `w` | save the current items into items.json |
| `<ctrl-c>` | exit without saving |

### Insert mode

| command    |      effect      |
|----------|--------------|
| `<ctrl-u>` | delete everything and start again |
| `<esc>` | escape back to normal mode, without adding a new item |
| `<enter>` when inserting text | progress from into inserting days |
| `<enter>` when inserting days | go back to normal mode, but with the newly added item |
| `<ctrl-c>` | exit without saving |

### Visual mode

| command    |      effect      |
|----------|--------------|
| `v` | go back to normal mode |
| `j` | move the current item one line downward |
| `k` | move the current item one line upward |
| `<ctrl-c>` | exit without saving |
