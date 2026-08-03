<script lang="ts">
	import { untrack } from "svelte";
	import { superForm, type SuperValidated } from "sveltekit-superforms";

	let { data }: { data: SuperValidated<{ amount: number }> } = $props();
	const { form, errors, enhance, message, submitting } = superForm(untrack(() => data));
</script>

<form method="POST" use:enhance class="flex flex-col items-center gap-4">
	<label class="fieldset" for="increment-amount">
		<span class="fieldset-legend">Increment by</span>
		<input
			id="increment-amount"
			type="number"
			name="amount"
			min="1"
			max="100"
			class="input w-24 text-center"
			class:input-error={$errors.amount}
			bind:value={$form.amount}
			aria-invalid={$errors.amount ? "true" : undefined}
			aria-describedby={$errors.amount ? "amount-errors" : undefined}
		/>
		{#if $errors.amount}
			<p id="amount-errors" class="label text-error">{$errors.amount.join(", ")}</p>
		{/if}
	</label>

	<button class="btn btn-primary" disabled={$submitting}>
		{$submitting ? "Incrementing..." : "Increment"}
	</button>
</form>

{#if $message}
	<div class="alert alert-success max-w-sm" role="status">{$message}</div>
{/if}
