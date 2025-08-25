// This is a vendored copy of get-stdin, modified to include type annotations
// and adhere to formatting style in the prettierd repo. We should get rid of
// this file once we migrate prettierd to esmodules.
//
// get-stdin is licensed under the MIT license. The full license is available
// below:
//
//
//
// MIT License
//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

const { stdin } = process;

async function getStdinBuffer(): Promise<Buffer> {
  if (stdin.isTTY) {
    return Buffer.alloc(0);
  }

  const result = [];
  let length = 0;

  for await (const chunk of stdin) {
    result.push(chunk);
    length += chunk.length;
  }

  return Buffer.concat(result, length);
}

export default async function getStdin(): Promise<string> {
  const buffer = await getStdinBuffer();
  return buffer.toString("utf8");
}
