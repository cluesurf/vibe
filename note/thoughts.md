If it can nest and nest, like a recursive fractal, the higher links to
the immediate lower.

The lowers are not isolated necessarily, they link together.

The two higher would be linked, then you would go across, up, down.

- {3,7}

nest

When does the system "nest" and fold inside?

- Can potentially continue nesting every step.
- Can potentially rely on some conditions.
- Can potentially nest to an equilibrium for some reason.

- When does it nest? What are all the ways it can nest?
- When does it feel? What are all the ways it can feel?
- When does it fuse?
- What are the set of possible tones?

- split into 8
  - each 8
    - container
    - 3 neighbors
- rules
  - feel from neighbors?
  - or feel from children only?
    - results in only propagate signal up
  - feel from parent?

Will is moving your center of vibes so it accepts pain and gives
pleasure to move to where it wants to go.

If it just read pleasure from everywhere, and followed the pleasure
trail, then everyone would follow that and maybe not go anywhere.

If you just read the pain, then it would be unbearable.

- So maybe it can split when it feels maximum pain.

So imagine an octree nested deeply 20 layers inside. You are feeling
your whole self as the sum of all the pieces. You let the subvibes
choose to follow the road of pain or pleasure. And you can also regain
control of it somehow to some degree, and move in unison.

So there is a "mind" when the vibe has nested internal structure.

The nested structure is basically. A parallel computer. Letting each
vibe live its own independent existence, and search out its own path,
relinquishing control from a central authority and giving it its own
independent agency, even though it is nested within a higher vibe, a
mind. The mind "decides" which action to take, meaning it "becomes" a
"tone" so it can integrate into its surroundings the best, like a social
system. It might "choose" to feel pain, so that others can feel
pleasure, but ultimately it then "collapses" and subdivides perhaps, on
pure pain.

Choosing pleasure, it essentially takes the baton from another vibe
feeling pleasure. So pleasure radiates and is absorbed. But you can't
just "choose" positive tone. It has to come to you. You can choose
negative perhaps, so we do have a sense of choice. Choose pain. And
question is when do we subdivide.

- freedom of choice
- can only choose pain
- can accept pleasure
- higher-order vibes are "minds", experiencing the parallel association
  matrix at once, but delegating the freedom of choice to each
  subdivision.
- so in a sense, you can "mine" pleasure by isolating and managing pain.
- pleasure is radiated. it is sensed. it can perhaps be ignored (let
  them keep experiencing it), or taken, they now experience pain. Or
  there could be more than pain/pleasure system (more than boolean
  encoding). Can try ternary, and other encodings to see.

- choices a base vibe (primitive vibe) can make
  - take the pleasure from neighbors
  - endure the pain
- depends on how many links they have, and the code

a base vibe "knows" it is causing the mind vibe (parent vibe) pleasure
or pain because whatever it feels it propagates up to the mind vibe. the
mind vibe "knows" it is feeling a mixture of pain and pleasure because
of the experience of its nested vibes' tones.

- with 8 nested vibes

  - byte = 256 possible states
    - 128 pleasure leaning
    - 128 pain leaning

- 3 links, 1 home

  - option 1: communicate direct links within home and home itself only,
    not outside of home
  - option 2: can communicate to all surrounding links
    - but that would mean the whole system has to extend down a depth,
      so everything is connected at that level, which seems more complex
    - so option 1 makes sense first, communicate nearby and up, but also
      vibes need to communicate down somehow

- 7, connected to all links at diagonals in a home too.
- 8 with parent
- so then each nested node has 8 inputs (7 neighbors and 1 parent)
- each parent has 8 children determining its state

So then its like, you easily have a node feeling a spectrum of 256
possibilities, and it is felt as a positive or negative or perfect
balance

```
(11110000) = 70
(11111000) = 56
(11111100) = 28
(11111110) = 8
(11111111) = 1

n!/(k!(n−k)!)
​
+ 56
+ 28
+ 8
+ 1
= 93

93 positive
93 negative
70 neutral
```

```
1
8
28
56
70
56
28
8
1
```

9 states

So the parent if below at or above peace gives 3 possibilities. But
perhaps peace gets counted less somehow.

- So each nested child node has 8 links (7 siblings and 1 parent).
- parent has 8 children so has 8 bits of information, 256 possible
  combinations, or 9 possible states.

- node measures 8 links and chooses pain or accepts pleasure.
- pleasure can be experienced several beats in a row if it has been
  accumulated in chain of neighbors. Otherwise it takes it from one node
  and transfers it to another node.

- system examples

  - 10101010 becomes
  - 01010101 alternate back and forth
  - parent stays at peace, children experience pure pain and pure
    pleasure.

  0 1 1 0

Each depth level reads from its neighbors and parent, and children.

- 256 internal combinations
- 8 external links

How do the internal and external integrate?

- internal
- external

- read the state from the neighbors (8 links, 256 values)
- read the state from the children (256)

Should it treat parent differently than siblings? Yes.

- parent gets some multiplier.
- so 7 and 1

- external: 7 bits + 1 parent bit
- internal: 8 bits
- 16 bits to determine next state.
- tone = 1 bit

feel = 1 bit (mixture of 16 bits)

- 8 links (leaf vibe)
- 16 links (home vibe)

## The 8-tree Example

The 8-tree is essentially modelled after the "octree" data structure. It
recursively divides into 8 subcubes as necessary. When it divides is up
for exploration, not sure. We can say for example that it divides when
all nodes experience pure pain. Or when some number of them experience
pure pain. Or all experience pure pleasure, or whatever.

The "8-tree rise" can be where it.... Nevermind.

In the beginning it is a single vibe, a single node tree. It experiences
neither pain nor pleasure. Perfect peace. It has no sides, no numbers,
no parts. It is one. Whole.

Then it subdivides, it nests. Into 8 internal pieces, and one home
container. Could ask how does it divide, or what does it divide into?

For now we can assume each nested node feels all other vibes in the
nest, and the nest itself experiences (not just feels) all nested vibes.
So there is a division into...

Or you could say that One is both positive and negative at once, and the
two tones were more balanced separated. So it split into 4 1's and 4
0's.

The one was balanced, still at peace. But the sons were imbalanced, and
could only accept pleasure or choose pain. So the ones in pain can
choose to endure pain, and the ones in pleasure are in perfect pleasure,
so they split. This time into children with all 8 1's.

Now the system evolves.

That is one potential initial rule code.

Please write a TypeScript function and data structure to evolve an
octree sort of system as described.

- Start with one node in frame one.
- Since it is in the peace state, it divides into equal 1's and 0's. So
  recursively subdivide into 8 child nodes, alternating their state 1
  vs. 0. The parent state is balanced. If it's ever balanced, it maybe
  serves as a signal amplifier. That is, it never has it's own readable
  state, since there is nothing outside of it.

Various rules for subdividing.

- divide if all siblings are 1
  - divide into any of 256 combinations

```
1 => 10101010
00000000 => 0
```

And otherwise it chooses pain or accepts pleasure.

```ts
type Tone = 1 | 0

type Vibe = LeafVibe | NestVibe
type SiteVibe = LeafVibe | NestVibe | BaseVibe

// this is the "foundation" of the whole system,
// the universe.
type BaseVibe = {
  form: 'base'
  // the resonating frequency (positive or negative) of the vibe
  tone: Tone
  // children
  nest: [Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe]
}

// this is a child without any children
type LeafVibe = {
  form: 'leaf'
  tone: Tone
  // parent
  site?: NestVibe | HomeVibe
  // siblings
  link: [Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe]
}

// this is an internal node
type NestVibe = {
  form: 'nest'
  tone: Tone
  // parent
  site?: NestVibe | HomeVibe
  // siblings
  link: [Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe]
  // children
  nest: [Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe, Vibe]
}
```

So then create a `walk` function to evolve this system:

```ts
let beat = 0

function tick(base: BaseVibe) {
  if (beat === 0) {
    nest(base)
  } else {
    walk(base)
  }

  beat++
}

function nest(nest: BaseVibe | NestVibe) {
  let i = 0

  while (i < 8) {
    const leafVibe = { form: 'leaf', tone: i % 2 === 0 ? 0 : 1 }
    nest.nest.push(leafVibe)
  }
}

function walk(site: SiteVibe) {}
```


vibe

Like you are steering a ship. The ocean of waves and impact is happening to you, and you need to adjust course to go in the right direction. Something happens to you, you react.

But there is no separation between something happening to you and you doing something to something else, it happens at the same time. It is like a card game. Everyone picks out their cards, then lays them out at the same time, and then the winners are found at that moment.

Each vibe is has its own will and wants.

It has a meet, the set of linked vibes.

The question is, how does the exchange work.

```
muse
hold show
fuse
meet feel
```

```
1 3 8

0 = 1
1 = 12
2 = 66
3 = 220
4 = 495
5 = 792
6 = 924
7 = 792
8 = 495
9 = 220
10 = 66
11 = 12
12 = 1
```

How I feel inside. How I feel for my brothers. How I feel for my environment.

Tune to fit the ideal vibe.

```
charge

positive charge

+ -    + *
- + => * - => ...

Choose to put something somewhere. Lay down your card.

- All vibes lay down their card/tone based on their internal state memory.
- The vibes dock their tone.
- The vibes read/feel their internal state, and anticipate the cards that are going to be played by the peers.

Or go with the flow.

Or fight a battle every tick.

- win/lose/tie

will 1, meet 11001100, feel 0
will 0, meet 11110000, feel 0

3 siblings
3 * 8
1 parent = 8
8 * 8 siblings

12

The 12 disciples.

7 siblings, 1 parent, 8 children

It decides (wills) based on its childrens needs, and how it can play with the siblings and nest.

- reads siblings/parents (external) after it plays its hands, after reading its own internal state.

hold 11111111, want 0, meet 11110000

hold pleasure, want fall, meet bad-links, feel pain
  if site.nest > 4 && want fall && link <= 4, feel fall
hold pleasure, want fall, meet good-links, feel pain
  if site.nest > 4 && want fall && link > 4, feel fall
hold pleasure, want rise, meet bad-links, feel pain
  if site.nest > 4 && want rise && link <= 4, feel fall
hold pleasure, want rise, meet good-links, feel pleasure
  if site.nest > 4 && want rise && link > 4, feel rise

hold pain, want rise, meet bad-links, feel pain
  if site.nest <= 4 && want rise && link <= 4, feel fall
hold pain, want rise, meet good-links, feel pleasure
  if site.nest <= 4 && want rise && link > 4, feel rise
hold pain, want fall, meet bad-links, feel pleasure
  if site.nest <= 4 && want fall && link <= 4, feel rise
hold pain, want fall, meet good-links, feel pleasure
  if site.nest <= 4 && want fall && link > 4, feel rise

hold 00000001, want rise, meet 00000000, feel fall
hold 00000011, want rise, meet 00000000, feel fall
hold 00000111, want rise, meet 00000000, feel fall
hold 00001111, want rise, meet 00000000, feel fall

export enum Tone {
  Rise = 1,
  Fall = 0,
}

want
```


- decision

- write down

It's driven from top-down and bottom-up somehow, at the same time.

- individuals make their decision based on surrounding information.
-

- if all sites in a nest have to come to an agreement, like rock-paper-scissors, and if they all choose what they wanted, then they all get their updates.

- rock-paper-scissors
- rock defeats scissors
- rock loses to paper
- scissors defeats paper
- scissors loses to rock
- paper defeats rock
- paper loses to scissors

- pleasure defeats peace
- peace defeats pain
- pain defeats pleasure

- choose pain

Or you can trade perhaps, with neighbors.

- up/down/stay

- 8

- red, blue, yellow

You have to solve their problem, bring them toward peace.

- pleasure, make peace
- pain, make peace

You, and your neighbors have to optimize for balance perhaps.

- I feel pain
- They feel pleasure
- Take pleasure


Simplified model

- Infinite Nesting
- Independent Experience
- Decision-Making
- Game Rules
- Integrated Purpose

It boils down to a "vibe code". Here, "vibe" means raw experience, and code means a system of rules. What are the simplest set of rules for a vibe code?

1. Information can be binary, have only 2 possible tones (good or bad, pleasure or pain).
2. Experiences are interconnected into a network of some form.
3. System must be able to "grow" somehow, in this model via recursive subdivision.
4. Individual experiences must have agency to choose what they do.

Please introduce the topic in even more concise and simpler language, not using any of my technical terms. Brief, simple prose.
