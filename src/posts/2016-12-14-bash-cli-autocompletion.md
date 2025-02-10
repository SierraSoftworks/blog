---
title: Autocompletion for Bash CLI
date: 2016-12-14T10:41:20Z
permalinkPattern: :year/:month/:day/:slug/
tags:
  - development
  - github
  - bash
  - opensource

# cspell:ignore compgen, CWORD, COMPREPLY
---

# Autocompletion for Bash CLI

::: tip
If you haven't yet read the article on
[Bash CLI](https://github.com/SierraSoftworks/bash-cli) then
go [read it now](/post/bash-cli).
:::

Bash's ability to automatically provide suggested completions to a command
by pressing the <kbd>Tab</kbd> key is one of its most useful features. It
makes navigating complex command lines trivially simple, however it's generally
not something we see that often.

Bash CLI was designed with the intention of making it as easy as possible to
build a command line tool with a great user experience. Giving our users the
ability to use autocompletion would be great, but we don't want to make it
any more difficult for developers to build their command lines.

Thankfully, Bash CLI's architecture makes adding basic autocomplete possible
without changing our developer-facing API (always a good thing).

<!-- more -->

## How does Bash completion work?
Bash's completion feature is controlled through the `complete` builtin function
and can be configured with a huge variety of different options. These options
include defaults for files, services, processes, users and groups (among many
others), however due to the nature of Bash CLI, we'll need to look their more
complex options - script and function based completions.

### Script Completion
Script based completion executes a shell script and uses its output to generate
the completion list. This is a great solution for simple implementations as it
doesn't require much complexity at all.

```sh
#!/bin/bash

# Completion definition for a `hello` script which suggests `world` as
# its arguments.
compgen -W 'world' -- $1
```

Unfortunately, the arguments that this script receives are a bit odd and don't
really work for Bash CLI.

```sh
$ echo '#!/bin/bash\n>&2 echo "Got \\$@: $@"' > test_complete
$ complete -C "$(pwd)/test_complete" test
$ test 1 2 3 4 5
Got $@: 5 4
```

Okay, so if we can't use script completion, what are our other options?

### Function Completion
Function completion in Bash allows you to provide the name of a function which
will handle the generation of autocompletion suggestions. The function receives
a couple of variables which we can use...

```sh
#!/bin/bash

function _test_complete() {
    >&2 echo "CurrArg: ${COMP_CWORD}"
    >&2 echo "Args:    ${COMP_WORDS[@]}"

    COMPREPLY=(`compgen -W 'world' -- "${COMP_WORDS[COMP_CWORD]}"`)
}
complete -F _test_complete test
```

```sh
$ test a b c d e
CurrArg: 5
Args: a b c d e
```

This is obviously far more useful to us, since it gives us every argument passed to
the application.

## Completion for Bash CLI
Bash CLI's design means that it is always looking for files and folders relative to
its application directory. This makes the process of providing options rather
straightforward, one just needs to list files and folders which match the command
naming pattern relative to the current command directory.

So now that we've got the current arguments, we can use Bash CLI's command resolution
logic to figure out the current command directory. Once we have that, we just need to
get the list of command options and format them for Bash.

### Getting the list of options
To find the various options, we're using the `find` command. It's far better to work
with `find` than it is to attempt to parse `ls` output, as it provides functionality
for more granular control over your output.

We're using an interesting little hack which bypasses any odd behaviour as a result
of special characters in filenames.

```sh
local opts=("help")
while IFS= read -d $'\0' -r file; do
    opts=("${opts[@]}" `basename $file`)
done < <(find ./ -maxdepth 1 ! -path ./ ! -iname '*.*' -print0)
```

What we do here is pair the `find` command in `-print0` mode (which prints a `\0`
character at the end of each entry) with `read` to get the name of each file.

The `find` command has `-maxdepth 1` and `! -path ./` specified to ensure we only
get entries in the top level directory and don't include the top-level directory
in the list of results. We're also ignoring entries with a `.` in their name by
passing `! -iname '*.*'`, removing all the files like `.author`, `cmd.usage` etc.

### Formatting the options
Formatting of the options, and filtering by the current input, is conduced using
the `compgen` builtin function in Bash. We pass it a word list built up from
our `$opts` array.

```sh
IFS="
"
COMPREPLY=(
    `compgen -W "$(printf '%s\n' "${opts[@]}")" -- "${COMP_WORDS[COMP_CWORD]}"`
)
```

We set `$IFS` (the separator characters) to be a newline and then use `printf`
to format our options with newline separators between each. This gets passed
as the words list to `compgen` along with the current input and we let it handle
the final filtering and formatting.

## Installing the Completions
Completions are installed by placing them in `/etc/bash_completion.d/`. Since
we don't want to violate Bash CLI's API guarantees (which are that changes to
files in your project directory are automatically propagated), we'll use a
completions file like the following.

```sh
source "/opt/bash-cli/complete"

# Register the _bash_cli completion function for `bash-cli`
complete -F _bash_cli bash-cli
```

## Resulting Functionality
Now that we've added the functionality, let's see a demo of how it works
on the Bash CLI project's commands.

<!-- cspell:disable-next-line -->
<asciinema cast="b61d9hay2p1labwayfyg19aq6"/>
