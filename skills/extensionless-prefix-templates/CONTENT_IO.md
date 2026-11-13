# Content I/O（对齐 cmd-file-reading / safenet-decrypted-reading）

文本类读写优先 `cmd /c type` 明文；禁止把 E-SafeNet/LOCK 密文壳当成功写回。见 scripts/ContentIO.ps1。
## Encryption policy (hard rules)

- Skill pack MUST be plaintext: templates/ assets/ seed-plain/ reference/ must NOT contain E-SafeNet LOCK ciphertext shells. Templates must be ContentIO-readable plaintext; if no seed match, plaintext SCAFFOLD_STUB is OK.
- Generated projects MAY be encrypted: writing to paths like D:\WorkSpace\git\... may re-encrypt files by local policy. That is expected. Do NOT decrypt or clear locks on generated projects. Cursor / Android Studio / cmd type can still read plaintext.
- Maintain skill pack by ContentIO read-then-write from ag6.0 or seed-plain into the skill directory. Never Copy/Rename LOCK shells into the skill pack.
- CN: skill pack plaintext only; generated project may encrypt; do not decrypt generated project.
